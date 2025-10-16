import { FileEntity, MimeType, TreeNode } from '@site/types';

interface TempNode {
  name: string;
  mimeType?: MimeType;
  children: Record<string, TempNode>;
}

export function buildTree(entities: FileEntity[]): TreeNode[] {
  const root: Record<string, TempNode> = {};

  // 建立樹狀結構
  for (const entity of entities) {
    const parts = entity.path.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!currentLevel[part]) {
        currentLevel[part] = { name: part, children: {} };
      }

      const node = currentLevel[part];

      // 只有最後一層才指定 mimeType
      if (i === parts.length - 1 && entity.mimeType) {
        node.mimeType = entity.mimeType;
      }

      currentLevel = node.children;
    }
  }

  function convert(obj: Record<string, TempNode>): TreeNode[] {
    return Object.values(obj).map((node) => ({
      name: node.name,
      mimeType: node.mimeType,
      children: Object.keys(node.children).length
        ? convert(node.children)
        : undefined,
    }));
  }

  return convert(root);
}
