declare global {
  type FileMimeType = 'zipfile' | 'txt' | 'folder';

  interface TreeNode {
    name: string;
    mimeType?: FileMimeType;
    children?: TreeNode[];
  }

  interface FileEntity {
    path: string;
    mimeType?: FileMimeType;
    sizeBytes?: number;
    createdAtISO?: string; // ISO string
    latestUpdatedAtISO?: string; // ISO string
  }
}

export {};
