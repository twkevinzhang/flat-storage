<script setup lang="ts">
import { EntityPath } from '@site/models';

const { path } = defineProps<{
  path: EntityPath;
}>();

const emit = defineEmits<{
  (e: 'navigate', newPath: EntityPath): void;
}>();

const parts = computed(() => [
  EntityPath.root(path.sessionId!),
  ...path.segments
    .slice(0, -1) // 最後一個 part 不顯示
    .map((s, index) =>
      EntityPath.fromRoute({
        sessionId: path.sessionId!,
        mount: path.segments.slice(0, index + 1).join('/'),
      })
    ),
]);
</script>

<template>
  <nav
    class="p-2 flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-normal"
  >
    <template v-for="(part, index) in parts" :key="index">
      <Hover
        severity="link"
        paddingSize="none"
        :fluid="false"
        @click="() => emit('navigate', part)"
        :label="part.name"
      />

      <PrimeIcon name="angle-right" />
    </template>
  </nav>
</template>
