import { useUploadStore } from '@site/stores/upload';
import { useSessionStore } from '@site/stores/session';
import { UploadTask, UploadStatus, SessionEntity } from '@site/models';
import { calculateHashes, calculateCRC32C } from '@site/utilities';
import { proxyBucket } from '@site/utilities/storage';
import axios from 'axios';

export interface UploadProgress {
  taskId: string;
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  speed: number;
  estimatedTimeRemaining: number;
}

export class UploadManager {
  private static instance: UploadManager;
  private uploadStore = useUploadStore();
  private sessionStore = useSessionStore();
  private activeUploads = new Map<string, AbortController>();
  private readonly MAX_CONCURRENT = 3;
  private readonly CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
  private progressTrackers = new Map<string, ProgressTracker>();

  private constructor() {
    this.startProcessing();
  }

  static getInstance(): UploadManager {
    if (!UploadManager.instance) {
      UploadManager.instance = new UploadManager();
    }
    return UploadManager.instance;
  }

  /**
   * 開始處理上傳佇列
   */
  private async startProcessing() {
    setInterval(() => {
      this.processQueue();
    }, 1000);
  }

  /**
   * 處理上傳佇列，確保最多 3 個並行上傳
   */
  private async processQueue() {
    const uploadingCount = this.uploadStore.uploadingTasks.length;

    if (uploadingCount >= this.MAX_CONCURRENT) {
      return;
    }

    // 找到優先級最高的 PENDING 任務
    const pendingTasks = this.uploadStore.tasks
      .filter((t) => t.status === UploadStatus.PENDING)
      .sort((a, b) => a.priority - b.priority);

    const slotsAvailable = this.MAX_CONCURRENT - uploadingCount;
    const tasksToStart = pendingTasks.slice(0, slotsAvailable);

    for (const task of tasksToStart) {
      this.startUpload(task);
    }
  }

  /**
   * 開始上傳單個任務
   */
  private async startUpload(task: UploadTask) {
    const session = this.sessionStore.get(task.sessionId);
    if (!session) {
      this.uploadStore.updateTask(task.id, {
        status: UploadStatus.FAILED,
        error: 'Session not found',
      });
      return;
    }

    const abortController = new AbortController();
    this.activeUploads.set(task.id, abortController);

    try {
      // 階段 1: 計算 Hash (xxHash64 + CRC32C)
      await this.calculateHashPhase(task);

      // 階段 2: 建立可恢復上傳會話
      await this.createResumableUploadSession(task, session);

      // 階段 3: 分塊上傳
      await this.uploadChunks(task, session, abortController.signal);

      // 階段 4: 驗證 CRC32C
      await this.verifyCRC32C(task, session);

      // 標記為完成
      this.uploadStore.updateTask(task.id, {
        status: UploadStatus.COMPLETED,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // 用戶取消
        return;
      }

      this.uploadStore.updateTask(task.id, {
        status: UploadStatus.FAILED,
        error: error.message,
      });
    } finally {
      this.activeUploads.delete(task.id);
      this.progressTrackers.delete(task.id);
    }
  }

  /**
   * 階段 1: 計算 Hash
   */
  private async calculateHashPhase(task: UploadTask) {
    this.uploadStore.updateTask(task.id, {
      status: UploadStatus.CALCULATING,
    });

    // 從 IndexedDB 或其他地方獲取原始 File 物件
    // 注意：File 物件無法直接序列化到 IndexedDB，需要特殊處理
    const file = await this.getFileFromTask(task);

    const { xxHash64, crc32c } = await calculateHashes(file, (progress) => {
      // 可選：更新計算進度
      console.log(`Calculating hash for ${task.id}: ${progress.toFixed(1)}%`);
    });

    // 生成 GCS 檔案名稱: ISO-8601-timestamp-xxHash64
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const gcsFileName = `${timestamp}-${xxHash64}`;

    this.uploadStore.updateTask(task.id, {
      xxHash64,
      crc32c,
      gcsFileName,
    });
  }

  /**
   * 階段 2: 建立可恢復上傳會話
   */
  private async createResumableUploadSession(
    task: UploadTask,
    session: SessionEntity
  ) {
    if (!task.gcsFileName) {
      throw new Error('GCS file name not generated');
    }

    const bucket = proxyBucket(session);
    const targetPath = task.targetPath
      ? `${task.targetPath}/${task.gcsFileName}`
      : task.gcsFileName;

    const file = bucket.file(targetPath);

    const [uploadUrl] = await file.createResumableUpload({
      metadata: {
        contentType: task.file.type,
        metadata: {
          originalName: task.readableName,
          xxHash64: task.xxHash64,
          crc32c: task.crc32c,
        },
      },
    });

    this.uploadStore.updateTask(task.id, {
      uploadUri: uploadUrl,
      status: UploadStatus.UPLOADING,
    });
  }

  /**
   * 階段 3: 分塊上傳
   */
  private async uploadChunks(
    task: UploadTask,
    _session: SessionEntity,
    signal: AbortSignal
  ) {
    if (!task.uploadUri) {
      throw new Error('Upload URI not found');
    }

    const file = await this.getFileFromTask(task);
    const totalBytes = file.size;
    let uploadedBytes = task.uploadedBytes || 0;

    const tracker = new ProgressTracker(task.id, totalBytes);
    this.progressTrackers.set(task.id, tracker);

    while (uploadedBytes < totalBytes) {
      if (signal.aborted) {
        throw new Error('Upload cancelled');
      }

      const start = uploadedBytes;
      const end = Math.min(uploadedBytes + this.CHUNK_SIZE, totalBytes);
      const chunk = file.slice(start, end);

      await this.uploadChunk(
        task.uploadUri,
        chunk,
        start,
        end - 1,
        totalBytes,
        signal
      );

      uploadedBytes = end;

      // 更新進度
      tracker.update(uploadedBytes);
      this.uploadStore.updateTask(task.id, {
        uploadedBytes,
      });
    }
  }

  /**
   * 上傳單個分塊
   */
  private async uploadChunk(
    uploadUri: string,
    chunk: Blob,
    start: number,
    end: number,
    total: number,
    signal: AbortSignal
  ) {
    const headers = {
      'Content-Length': chunk.size.toString(),
      'Content-Range': `bytes ${start}-${end}/${total}`,
    };

    await axios.put(uploadUri, chunk, {
      headers,
      signal,
    });
  }

  /**
   * 階段 4: 驗證 CRC32C
   */
  private async verifyCRC32C(task: UploadTask, session: SessionEntity) {
    if (!task.gcsFileName || !task.crc32c) {
      throw new Error('Missing GCS file name or CRC32C hash');
    }

    const bucket = proxyBucket(session);
    const targetPath = task.targetPath
      ? `${task.targetPath}/${task.gcsFileName}`
      : task.gcsFileName;

    const file = bucket.file(targetPath);
    const [metadata] = await file.getMetadata();

    // GCS 返回的 CRC32C 是 base64 編碼的
    // 我們需要比較計算出的 CRC32C 和 GCS 返回的值
    const gcsCrc32c = metadata.crc32c;

    if (!this.verifyCrc32cMatch(task.crc32c, gcsCrc32c)) {
      // 驗證失敗，刪除 GCS 文件
      await file.delete();

      throw new Error('CRC32C verification failed');
    }
  }

  /**
   * 比較 CRC32C 值
   */
  private verifyCrc32cMatch(calculated: string, gcsValue: string): boolean {
    // GCS 返回的是 base64 編碼的 CRC32C
    // 我們計算出的是 hex 格式
    // 需要進行轉換比較

    // 將 hex 轉換為 Uint8Array
    const hexBytes = calculated.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    const uint8Array = new Uint8Array(hexBytes);

    // 轉換為 base64
    const calculatedBase64 = btoa(String.fromCharCode(...uint8Array));
    return calculatedBase64 === gcsValue;
  }

  /**
   * 從任務中獲取 File 物件
   */
  private async getFileFromTask(task: UploadTask): Promise<File> {
    const file = this.uploadStore.getFile(task.id);
    if (!file) {
      throw new Error(`File not found for task ${task.id}`);
    }
    return file;
  }

  /**
   * 暫停上傳
   */
  pauseUpload(taskId: string) {
    const controller = this.activeUploads.get(taskId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(taskId);
    }
    this.uploadStore.updateTask(taskId, {
      status: UploadStatus.PAUSED,
    });
  }

  /**
   * 恢復上傳
   */
  resumeUpload(taskId: string) {
    this.uploadStore.updateTask(taskId, {
      status: UploadStatus.PENDING,
    });
  }

  /**
   * 取消上傳
   */
  cancelUpload(taskId: string) {
    const controller = this.activeUploads.get(taskId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(taskId);
    }
    this.uploadStore.updateTask(taskId, {
      status: UploadStatus.CANCELLED,
    });
  }

  /**
   * 獲取上傳進度
   */
  getProgress(taskId: string): UploadProgress | null {
    const tracker = this.progressTrackers.get(taskId);
    return tracker ? tracker.getProgress() : null;
  }
}

/**
 * 進度追蹤器
 */
class ProgressTracker {
  private lastBytes = 0;
  private lastTime = Date.now();
  private speeds: number[] = [];
  private readonly SPEED_SAMPLE_SIZE = 5;

  constructor(
    private taskId: string,
    private totalBytes: number
  ) {}

  update(uploadedBytes: number) {
    const now = Date.now();
    const timeDiff = (now - this.lastTime) / 1000; // 秒
    const bytesDiff = uploadedBytes - this.lastBytes;

    if (timeDiff > 0) {
      const speed = bytesDiff / timeDiff; // bytes/s
      this.speeds.push(speed);
      if (this.speeds.length > this.SPEED_SAMPLE_SIZE) {
        this.speeds.shift();
      }
    }

    this.lastBytes = uploadedBytes;
    this.lastTime = now;
  }

  getProgress(): UploadProgress {
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
      percentage: (this.lastBytes / this.totalBytes) * 100,
      speed: avgSpeed,
      estimatedTimeRemaining,
    };
  }
}
