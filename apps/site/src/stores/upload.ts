import {
  UploadTask,
  UploadStatus,
  UploadProgress,
  SessionEntity,
  ObjectEntity,
  EntityPath,
} from '@site/models';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { nanoid } from 'nanoid';
import { calculateHashes } from '@site/utilities';
import { proxyBucket } from '@site/utilities/storage';
import axios from 'axios';
import { useMetadataStore } from '@site/stores/metadata';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONCURRENT = 3;

class ProgressTracker {
  private lastBytes = 0;
  private lastTime = Date.now();
  private speeds: number[] = [];
  private readonly SPEED_SAMPLE_SIZE = 5;

  // 構造函數接收必要的資訊
  constructor(private taskId: string, private totalBytes: number) {}

  update(uploadedBytes: number) {
    const now = Date.now();
    const timeDiff = (now - this.lastTime) / 1000;
    const bytesDiff = uploadedBytes - this.lastBytes;

    if (timeDiff > 0) {
      const speed = bytesDiff / timeDiff;
      this.speeds.push(speed);
      if (this.speeds.length > this.SPEED_SAMPLE_SIZE) {
        this.speeds.shift();
      }
    }

    this.lastBytes = uploadedBytes;
    this.lastTime = now;
  }

  // 這裡命名為 getMetrics，並移除參數（因為已在 constructor 傳入）
  getMetrics(): UploadProgress {
    const avgSpeed =
      this.speeds.length > 0
        ? this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length
        : 0;

    const remainingBytes = this.totalBytes - this.lastBytes;
    const estimatedTimeRemaining = avgSpeed > 0 ? remainingBytes / avgSpeed : 0;

    return {
      taskId: this.taskId,
      uploadedBytes: this.lastBytes,
      totalBytes: this.totalBytes,
      percentage:
        this.totalBytes > 0 ? (this.lastBytes / this.totalBytes) * 100 : 0,
      speed: avgSpeed,
      estimatedTimeRemaining,
    };
  }
}

export const useUploadStore = defineStore('upload', () => {
  const session = ref<SessionEntity | null>(null);
  const activeControllers = new Map<string, AbortController>();
  const trackers = new Map<string, ProgressTracker>();
  const metadataStore = useMetadataStore();

  const { data: persistentTasks } = useIDBKeyval<string[]>('upload_tasks', [], {
    deep: true,
  });
  const { data: persistentFiles } = useIDBKeyval<Record<string, File>>(
    'upload_files',
    {},
    { deep: true }
  );
  const tasks = computed({
    get: () => persistentTasks.value.map((json) => UploadTask.fromJson(json)),
    set: (value: UploadTask[]) => {
      persistentTasks.value = value.map((t) => t.toJson());
    },
  });

  const files = computed({
    get: () => persistentFiles.value,
    set: (value: Record<string, File>) => {
      persistentFiles.value = value;
    },
  });

  // 通知權限狀態
  const notificationPermission = ref<NotificationPermission>('default');

  // 檢查通知權限
  if ('Notification' in window) {
    notificationPermission.value = Notification.permission;
  }

  /**
   * 請求通知權限
   */
  async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      notificationPermission.value = permission;
      return permission === 'granted';
    }

    return false;
  }

  /**
   * 發送通知
   */
  function sendNotification(
    title: string,
    body: string,
    _type: 'success' | 'error' | 'info' = 'info'
  ) {
    // 如果頁面在前景，不發送通知
    if (document.visibilityState === 'visible') {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: `/favicon.ico`,
        tag: 'upload-notification',
      });
    }
  }

  const uploadingTasks = computed(() =>
    tasks.value.filter((t) => t.status === UploadStatus.UPLOADING)
  );
  const pendingTasks = computed(() =>
    tasks.value
      .filter((t) => t.status === UploadStatus.PENDING)
      .sort((a, b) => a.priority - b.priority)
  );
  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.status === UploadStatus.COMPLETED)
  );
  const activeTasks = computed(() =>
    tasks.value.filter(
      (t) =>
        ![UploadStatus.COMPLETED, UploadStatus.CANCELLED].includes(t.status)
    )
  );

  const totalProgress = computed(() => {
    const active = activeTasks.value;
    if (!active.length) return 0;
    const total = active.reduce((s, t) => s + t.file.size, 0);
    const uploaded = active.reduce((s, t) => s + t.uploadedBytes, 0);
    return total > 0 ? Math.round((uploaded / total) * 100) : 0;
  });

  // --- 自動調度器 (Reactive Scheduler) ---
  // 當上傳中的任務少於限制，且有待處理任務時，自動啟動
  watch(
    [uploadingTasks, pendingTasks],
    () => {
      if (
        uploadingTasks.value.length < MAX_CONCURRENT &&
        pendingTasks.value.length > 0
      ) {
        if (!session.value) return;
        const nextTask = pendingTasks.value[0];
        processUpload(nextTask, session.value);
      }
    },
    { immediate: true }
  );

  async function processUpload(task: UploadTask, session: SessionEntity) {
    const controller = new AbortController();
    activeControllers.set(task.id, controller);

    try {
      // 1. 雜湊計算
      if (!task.xxHash64) await runHashPhase(task.id);

      // 2. 取得會話路徑
      if (!task.uploadUri) await runSessionPhase(task.id, session);

      // 3. 執行分塊上傳 (核心 Reactive 部分)
      await runUploadPhase(task.id, controller.signal);

      // 4. 驗證
      // const metadata = await runVerifyPhase(task.id, session); // FIXME: bypass

      // 5. 更新 metadata store
      await runUpdateMetadata(task.id, session);

      updateTask(task.id, { status: UploadStatus.COMPLETED });

      // 發送完成通知
      sendNotification('上傳完成', `${task.file.name} 已成功上傳`, 'success');
    } catch (err: any) {
      console.error('上傳失敗:', err);
      if (err.name === 'AbortError') return;

      // 檢查是否為認證過期錯誤 (401, 403, expired token 等)
      const isAuthError =
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.message?.toLowerCase().includes('expired') ||
        err.message?.toLowerCase().includes('unauthorized') ||
        err.message?.toLowerCase().includes('forbidden');

      if (isAuthError) {
        updateTask(task.id, {
          status: UploadStatus.EXPIRED,
          error: 'Session 或憑證已過期，請重新創建 session',
        });
      } else {
        updateTask(task.id, {
          status: UploadStatus.FAILED,
          error: err.message,
        });
      }

      // 發送失敗通知
      sendNotification('上傳失敗', `${task.file.name} 上傳失敗`, 'error');
    } finally {
      activeControllers.delete(task.id);
      trackers.delete(task.id);
    }
  }

  /**
   * 階段 1: 雜湊計算 (xxHash64 & CRC32C)
   */
  async function runHashPhase(taskId: string) {
    updateTask(taskId, { status: UploadStatus.CALCULATING });
    const file = getFile(taskId);
    const { xxHash64, crc32c } = await calculateHashes(file);

    const createdAt = new Date().toISOString().replace(/[:.]/g, '-');
    updateTask(taskId, {
      xxHash64,
      crc32c,
      createdAt,
    });
  }

  /**
   * 階段 2: 建立可恢復上傳會話 (GCS Resumable)
   */
  async function runSessionPhase(taskId: string, session: SessionEntity) {
    const bucket = proxyBucket(session);
    const task = getTask(taskId);
    const [uploadUri] = await bucket
      .file(task.objectNameOnGcs())
      .createResumableUpload({
        metadata: {
          contentType: task.file.type,
          metadata: { xxHash64: task.xxHash64, crc32c: task.crc32c },
        },
      });
    updateTask(task.id, { uploadUri, status: UploadStatus.UPLOADING });
  }

  /**
   * 階段 3: 分塊上傳 (使用 Async Generator)
   */
  async function runUploadPhase(taskId: string, signal: AbortSignal) {
    const file = getFile(taskId);
    const task = getTask(taskId);
    const tracker = new ProgressTracker(task.id, file.size);
    trackers.set(task.id, tracker);

    // 定義非同步生成器來切割檔案
    async function* getChunks() {
      let offset = task.uploadedBytes;
      while (offset < file.size) {
        const end = Math.min(offset + CHUNK_SIZE, file.size);
        yield { blob: file.slice(offset, end), start: offset, end: end - 1 };
        offset = end;
      }
    }

    for await (const chunk of getChunks()) {
      try {
        const res = await axios.put(task.uploadUri!, chunk.blob, {
          signal,
          headers: {
            'Content-Range': `bytes ${chunk.start}-${chunk.end}/${file.size}`,
          },
        });
        console.log('res', res);
      } catch (err) {
        console.log('err', err);
        if (axios.isAxiosError(err)) {
        }
      }

      const nextOffset = chunk.end + 1;
      tracker.update(nextOffset);
      updateTask(task.id, { uploadedBytes: nextOffset });
    }
  }

  /**
   * 階段 4: CRC32C 校驗
   */
  async function runVerifyPhase(taskId: string, session: SessionEntity) {
    const bucket = proxyBucket(session);
    const task = getTask(taskId);
    const [metadata] = await bucket.file(task.objectNameOnGcs()).getMetadata();

    // 將 Hex 轉為 Base64 比對
    const hexToB64 = (hex: string) =>
      btoa(
        String.fromCharCode(
          ...(hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [])
        )
      );

    if (hexToB64(task.crc32c!) !== metadata.crc32c) {
      throw new Error('Verification failed: CRC32C mismatch');
    }

    return metadata;
  }

  /**
   * 階段 5: 更新 Metadata
   */
  async function runUpdateMetadata(taskId: string, session: SessionEntity) {
    const bucket = proxyBucket(session);
    const task = getTask(taskId);
    const [gcsMetadata] = await bucket
      .file(task.objectNameOnGcs())
      .getMetadata();

    const appMetadata = {
      path: EntityPath.fromRoute({
        sessionId: session.id,
        mount: task.path,
      }),
      mimeType: gcsMetadata.contentType,
      sizeBytes: Number(gcsMetadata.size),
      uploadedAtISO: gcsMetadata.timeCreated,
      latestUpdatedAtISO: gcsMetadata.updated,
      md5Hash: gcsMetadata.md5Hash,
      crc32c: gcsMetadata.crc32c,
      xxHash64: task.xxHash64,
    };
    const entity = ObjectEntity.new(appMetadata);

    await bucket.file(task.objectNameOnGcs()).setMetadata(appMetadata);

    await metadataStore.addEntity(session, entity);
  }

  /**
   * 工具函數
   */
  function getFile(taskId: string): File {
    const file = files.value[taskId];
    if (!file) throw new Error('File lost in browser memory');
    return file;
  }

  function getTask(taskId: string): UploadTask {
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) throw new Error('File lost in browser memory');
    return task;
  }

  function updateTask(taskId: string, updates: Partial<UploadTask>) {
    tasks.value = tasks.value.map((t) =>
      t.id === taskId ? UploadTask.merge(t, updates) : t
    );
  }

  function moveTask(taskId: string, direction: -1 | 1): void {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    const targetIndex = index + direction;

    // 邊界檢查
    if (index === -1 || targetIndex < 0 || targetIndex >= tasks.value.length)
      return;

    const current = tasks.value[index];
    const target = tasks.value[targetIndex];

    // 1. 交換數值
    [current.priority, target.priority] = [target.priority, current.priority];

    // 2. 交換位置
    [tasks.value[index], tasks.value[targetIndex]] = [
      tasks.value[targetIndex],

      tasks.value[index],
    ];
  }

  // UI 狀態
  const isCollapsed = ref(false);

  return {
    tasks,
    totalProgress,
    isCollapsed,
    activeTasks,
    completedTasks,
    notificationPermission,
    hasActiveUploads: computed(() => uploadingTasks.value.length > 0),
    requestNotificationPermission,
    createTask: (params: { sessionId: string; file: File; path: string }) => {
      const task = UploadTask.new({
        sessionId: params.sessionId,
        file: {
          name: params.file.name,
          size: params.file.size,
          type: params.file.type,
          lastModified: params.file.lastModified,
        },
        path: params.path,
        uploadedBytes: 0,
        status: UploadStatus.PENDING,
        priority: tasks.value.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      tasks.value = [...tasks.value, task];
      files.value[task.id] = params.file;
      return task;
    },
    pauseTask: (id: string) => {
      activeControllers.get(id)?.abort();
      updateTask(id, { status: UploadStatus.PAUSED });
    },
    resumeTask: (id: string) =>
      updateTask(id, { status: UploadStatus.PENDING }),
    cancelTask: (id: string) => {
      activeControllers.get(id)?.abort();
      updateTask(id, { status: UploadStatus.CANCELLED });
    },
    retryTask: (id: string) => {
      const task = tasks.value.find((t) => t.id === id);
      if (!task) return;

      // 重置任務狀態
      updateTask(id, {
        status: UploadStatus.PENDING,
        uploadedBytes: 0,
        error: undefined,
        uploadUri: undefined,
      });
    },
    removeTask: (taskId: string) => {
      tasks.value = tasks.value.filter((t) => t.id !== taskId);
    },
    clearCompletedTasks: () => {
      const completed = tasks.value.filter(
        (t) => t.status === UploadStatus.COMPLETED
      );
      tasks.value = tasks.value.filter(
        (t) => t.status !== UploadStatus.COMPLETED
      );
      completed.forEach((task) => {
        delete files.value[task.id];
      });
    },
    toggleCollapse: () => {
      isCollapsed.value = !isCollapsed.value;
    },
    setSession: (s: SessionEntity) => {
      session.value = s;
    },
    increasePriority: (id: string) => moveTask(id, -1),
    decreasePriority: (id: string) => moveTask(id, 1),
    getProgress: (id: string) => {
      const task = tasks.value.find((t) => t.id === id);
      return task ? trackers.get(id)?.getMetrics() || null : null;
    },
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUploadStore, import.meta.hot));
}
