declare global {
  type FileMimeType = 'zipfile' | 'txt' | 'folder';

  interface TreeNode {
    name: string;
    mimeType?: FileMimeType;
    children?: TreeNode[];
  }
}

export {};
