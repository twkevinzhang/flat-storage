<script setup lang="ts">
import { FileEntity } from '@site/models';

const props = defineProps<{
  entities: FileEntity[];
  filter?: (entity: FileEntity) => boolean;
}>();

const tree = computed(() => {
  const entities = props.filter
    ? props.entities.filter(filter)
    : props.entities;
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

  function convert(obj: Record<string, TempNode>): any {
    return map(obj, (node) => ({
      name: node.name,
      isFolder: node.mimeType === 'inode/directory',
      children: isEmpty(node.children) ? undefined : convert(node.children),
    }));
  }

  return convert(root);
});
</script>

<template>
  <div class="p-2 h-screen overflow-y-auto">
    <div class="p-2">
      <span class="font-bold">Explorer</span>
    </div>
    <ul>
      <PathTree v-for="node in tree" :key="node.name" :node="node" />
    </ul>
  </div>
</template>
