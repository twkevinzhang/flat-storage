import { nanoid } from 'nanoid';

export enum UploadStatus {
  PENDING = 'pending',
  CALCULATING = 'calculating',
  UPLOADING = 'uploading',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  VERIFICATION_FAILED = 'verification_failed',
  CANCELLED = 'cancelled',
}

export interface UploadTaskFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path?: string;
}

export class UploadTask {
  private constructor(
    public id: string,
    public sessionId: string,
    public file: UploadTaskFile,
    public targetPath: string,
    public objectName: string,
    public uploadedBytes: number,
    public status: UploadStatus,
    public priority: number,
    public createdAt: string,
    public updatedAt: string,
    public crc32c?: string,
    public xxHash64?: string,
    public uploadUri?: string,
    public error?: string
  ) {}

  private static from(params: {
    id: string;
    sessionId: string;
    file: UploadTaskFile;
    targetPath: string;
    objectName: string;
    uploadedBytes: number;
    status: UploadStatus;
    priority: number;
    createdAt: string;
    updatedAt: string;
    crc32c?: string;
    xxHash64?: string;
    uploadUri?: string;
    error?: string;
  }) {
    return new UploadTask(
      params.id,
      params.sessionId,
      params.file,
      params.targetPath,
      params.objectName,
      params.uploadedBytes,
      params.status,
      params.priority,
      params.createdAt,
      params.updatedAt,
      params.crc32c,
      params.xxHash64,
      params.uploadUri,
      params.error
    );
  }

  static merge(source: UploadTask, updates: Partial<UploadTask>): UploadTask {
    console.log('source', source, 'updates', updates);
    return UploadTask.from({
      id: updates.id ?? source.id,
      sessionId: updates.sessionId ?? source.sessionId,
      file: {
        name: updates.file?.name ?? source.file.name,
        size: updates.file?.size ?? source.file.size,
        type: updates.file?.type ?? source.file.type,
        lastModified: updates.file?.lastModified ?? source.file.lastModified,
      },
      targetPath: updates.targetPath ?? source.targetPath,
      crc32c: updates.crc32c ?? source.crc32c,
      xxHash64: updates.xxHash64 ?? source.xxHash64,
      objectName: updates.objectName ?? source.objectName,
      uploadUri: updates.uploadUri ?? source.uploadUri,
      uploadedBytes: updates.uploadedBytes ?? source.uploadedBytes,
      status: updates.status ?? source.status,
      priority: updates.priority ?? source.priority,
      error: updates.error ?? source.error,
      createdAt: updates.createdAt ?? source.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  static new(params: {
    sessionId: string;
    file: UploadTaskFile;
    targetPath: string;
    objectName: string;
    uploadedBytes: number;
    status: UploadStatus;
    priority: number;
    createdAt: string;
    updatedAt: string;
    crc32c?: string;
    xxHash64?: string;
    uploadUri?: string;
    error?: string;
  }): UploadTask {
    return UploadTask.from({
      id: nanoid(6),
      ...params,
    });
  }

  static fromJson(json: string): UploadTask {
    const obj = JSON.parse(json);
    const {
      id,
      sessionId,
      file,
      targetPath,
      objectName,
      uploadedBytes,
      status,
      priority,
      createdAt,
      updatedAt,
      crc32c,
      xxHash64,
      uploadUri,
      error,
      ...rest
    } = obj;
    return UploadTask.from({
      id,
      sessionId,
      file,
      targetPath,
      objectName,
      uploadedBytes,
      status,
      priority,
      createdAt,
      updatedAt,
      crc32c,
      xxHash64,
      uploadUri,
      error,
    });
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      sessionId: this.sessionId,
      file: this.file,
      targetPath: this.targetPath,
      objectName: this.objectName,
      uploadedBytes: this.uploadedBytes,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      crc32c: this.crc32c,
      xxHash64: this.xxHash64,
      uploadUri: this.uploadUri,
      error: this.error,
    });
  }

  objectNameOnGcs(): string {
    return `${this.createdAt}_${this.xxHash64}`;
  }

  gcsPath(): string {
    let path = '';
    if (this.targetPath === '/' || this.targetPath === '') {
      path = this.objectNameOnGcs();
    } else if (this.targetPath.startsWith('/')) {
      path = `${this.targetPath.slice(1)}/${this.objectNameOnGcs()}`;
    }
    return path;
  }
}

export interface UploadProgress {
  taskId: string;
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  speed?: number;
  estimatedTimeRemaining?: number;
}
