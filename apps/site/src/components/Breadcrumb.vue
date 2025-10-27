<script setup lang="ts">
const { path } = defineProps<{
  path: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', newPath: string): void;
}>();

const parts = computed(() => path.split('/').filter(Boolean));

const handleClick = (index: number) => {
  const newPath = parts.value.slice(0, index + 1).join('/');
  emit('navigate', newPath);
};
</script>

<template>
  <nav
    class="flex items-center gap-2 px-4 py-2 bg-white/70 max-w-full overflow-x-auto whitespace-nowrap"
  >
    <template v-for="(part, index) in parts" :key="index">
      <!-- 當前 part 不可點擊 -->
      <span
        v-if="index === parts.length - 1"
        class="text-sm font-medium text-gray-900 select-none"
      >
        {{ part }}
      </span>

      <!-- 可點擊的 part -->
      <button
        v-else
        class="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
        @click="handleClick(index)"
      >
        {{ part }}
      </button>

      <span v-if="index < parts.length - 1" class="text-gray-400 select-none"
        >/</span
      >
    </template>
  </nav>
</template>
