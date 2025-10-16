export type MimeType = 'zipfile' | 'txt' | 'folder';

export interface TreeNode {
  name: string;
  mimeType?: MimeType;
  children?: TreeNode[];
}

export interface FileEntity {
  path: string;
  mimeType?: MimeType;
  sizeBytes?: number;
  createdAtISO?: string; // ISO string
  latestUpdatedAtISO?: string; // ISO string
}
