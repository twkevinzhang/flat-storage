import { FileEntity } from '@site/models';

export function buildTree(entities: FileEntity[]): TreeNode[] {
  interface TempNode {
    name: string;
    mimeType?: FileMimeType;
    children: Record<string, TempNode>;
  }

  const root: Record<string, TempNode> = {};

  // 建立樹狀結構
  for (const entity of entities) {
    const parts = entity.path.split('/').filter(Boolean);
    if (size(parts) === 0) continue;

    let currentLevel = root;

    for (let i = 0; i < size(parts); i++) {
      const part = parts[i];
      if (!currentLevel[part]) {
        currentLevel[part] = { name: part, children: {} };
      }

      const node = currentLevel[part];

      // 只有最後一層才指定 mimeType
      if (i === latestIndex(parts) && entity.mimeType) {
        node.mimeType = entity.mimeType;
      }

      currentLevel = node.children;
    }
  }

  function convert(obj: Record<string, TempNode>): TreeNode[] {
    return map(obj, (node) => ({
      name: node.name,
      mimeType: node.mimeType,
      children: isEmpty(node.children) ? undefined : convert(node.children),
    }));
  }

  return convert(root);
}

export function latestIndex<T>(array: Array<T>): number {
  return size(array) - 1;
}
