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

export interface UploadTask {
  id: string;
  sessionId: string;
  file: UploadTaskFile;
  targetPath: string;
  readableName: string;
  crc32c?: string;
  xxHash64?: string;
  gcsFileName?: string;
  uploadUri?: string;
  uploadedBytes: number;
  status: UploadStatus;
  priority: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  taskId: string;
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  speed?: number;
  estimatedTimeRemaining?: number;
}
