<script setup lang="ts">
import { FileEntity } from '@site/models';

const { entities, filter } = defineProps<{
  entities: FileEntity[];
  filter?: (entity: FileEntity) => boolean;
}>();

const tree = computed(() =>
  buildTree(filter ? entities.filter(filter) : entities)
);
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
