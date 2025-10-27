<script setup lang="ts">
const { entities, filter } = defineProps<{
  entities: FileEntity[];
  filter?: (entity: FileEntity) => boolean;
}>();

const tree = computed(() =>
  buildTree(filter ? entities.filter(filter) : entities)
);
</script>

<template>
  <div class="p-2 bg-blue-50 shadow h-screen overflow-y-auto">
    <div class="p-2">
      <h2 class="text-2xl font-bold text-purple-700">Explorer</h2>
    </div>
    <ul>
      <PathTreeNode v-for="node in tree" :key="node.name" :node="node" />
    </ul>
  </div>
</template>
