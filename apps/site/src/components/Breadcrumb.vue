<script setup lang="ts">
const { path } = defineProps<{
  path: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', newPath: string): void;
}>();

const parts = computed(() => path.split('/').filter(Boolean));

const handleClick = (index: number) => {
  const newPath = take(parts.value, index + 1).join('/');
  emit('navigate', newPath);
};
</script>

<template>
  <nav class="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-normal">
    <template v-for="(part, index) in parts" :key="index">
      <Hover
        class="text-sm text-gray-500"
        severity="link"
        :label="part"
        @click="() => handleClick(index)"
      />

      <!-- 分隔符號 -->
      <PrimeIcon name="angle-right" />
    </template>
  </nav>
</template>
