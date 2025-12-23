import {
  UploadTask,
  UploadStatus,
  UploadProgress,
  SessionEntity,
} from '@site/models';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { nanoid } from 'nanoid';
import { calculateHashes } from '@site/utilities';
import { proxyBucket } from '@site/utilities/storage';
import axios from 'axios';

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

  const { data: tasks } = useIDBKeyval<UploadTask[]>('upload_tasks', [], {
    deep: true,
  });
  const { data: files } = useIDBKeyval<Record<string, File>>(
    'upload_files',
    {},
    { deep: true }
  );

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

  const totalProgress = computed(() => {
    const active = tasks.value.filter(
      (t) =>
        ![UploadStatus.COMPLETED, UploadStatus.CANCELLED].includes(t.status)
    );
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
      if (!task.xxHash64) await runHashPhase(task);

      // 2. 取得會話路徑
      if (!task.uploadUri) await runSessionPhase(task, session);

      // 3. 執行分塊上傳 (核心 Reactive 部分)
      await runUploadPhase(task, controller.signal);

      // 4. 驗證
      await runVerifyPhase(task, session);

      updateTask(task.id, { status: UploadStatus.COMPLETED });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      updateTask(task.id, { status: UploadStatus.FAILED, error: err.message });
    } finally {
      activeControllers.delete(task.id);
      trackers.delete(task.id);
    }
  }

  /**
   * 階段 1: 雜湊計算 (xxHash64 & CRC32C)
   */
  async function runHashPhase(task: UploadTask) {
    updateTask(task.id, { status: UploadStatus.CALCULATING });
    const file = getFile(task.id);
    const { xxHash64, crc32c } = await calculateHashes(file);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    updateTask(task.id, {
      xxHash64,
      crc32c,
      objectNameOnGcs: `${timestamp}-${xxHash64}`,
    });
  }

  /**
   * 階段 2: 建立可恢復上傳會話 (GCS Resumable)
   */
  async function runSessionPhase(task: UploadTask, session: SessionEntity) {
    const bucket = proxyBucket(session);
    const path = task.targetPath
      ? `${task.targetPath}/${task.objectNameOnGcs}`
      : task.objectNameOnGcs!;
    const [uploadUri] = await bucket.file(path).createResumableUpload({
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
  async function runUploadPhase(task: UploadTask, signal: AbortSignal) {
    const file = getFile(task.id);
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
      await axios.put(task.uploadUri!, chunk.blob, {
        signal,
        headers: {
          'Content-Range': `bytes ${chunk.start}-${chunk.end}/${file.size}`,
        },
      });

      const nextOffset = chunk.end + 1;
      tracker.update(nextOffset);
      updateTask(task.id, { uploadedBytes: nextOffset });
    }
  }

  /**
   * 階段 4: CRC32C 校驗
   */
  async function runVerifyPhase(task: UploadTask, session: SessionEntity) {
    const bucket = proxyBucket(session);
    const path = task.targetPath
      ? `${task.targetPath}/${task.objectNameOnGcs}`
      : task.objectNameOnGcs!;
    const [metadata] = await bucket.file(path).getMetadata();

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
  }

  /**
   * 工具函數
   */
  function getFile(taskId: string): File {
    const file = files.value[taskId];
    if (!file) throw new Error('File lost in browser memory');
    return file;
  }

  function updateTask(id: string, updates: Partial<UploadTask>) {
    const i = tasks.value.findIndex((t) => t.id === id);
    if (i !== -1)
      tasks.value[i] = {
        ...tasks.value[i],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
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

  return {
    tasks,
    totalProgress,
    hasActiveUploads: computed(() => uploadingTasks.value.length > 0),
    createTask: (params: {
      sessionId: string;
      file: File;
      targetPath: string;
      name: string;
    }) => {
      const id = nanoid();
      const task: UploadTask = {
        id,
        sessionId: params.sessionId,
        file: {
          name: params.file.name,
          size: params.file.size,
          type: params.file.type,
          lastModified: params.file.lastModified,
        },
        targetPath: params.targetPath,
        objectName: params.name,
        uploadedBytes: 0,
        status: UploadStatus.PENDING,
        priority: tasks.value.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      tasks.value.push(task);
      files.value[id] = params.file;
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
    removeTask: (taskId: string) => {
      const index = tasks.value.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        tasks.value.splice(index, 1);
        delete files.value[taskId];
      }
    },
    clearCompletedTasks: () => {
      tasks.value = tasks.value.filter(
        (t) => t.status !== UploadStatus.COMPLETED
      );
      completedTasks.value.forEach((task) => {
        delete files.value[task.id];
      });
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
