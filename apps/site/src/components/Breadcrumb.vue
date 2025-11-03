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

const linkable = ['hover:text-blue-600', 'hover:underline', 'cursor-pointer'];
</script>

<template>
  <div class="mx-4 mt-4">
    <nav class="flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-normal">
      <template v-for="(part, index) in parts" :key="index">
        <button
          :class="['text-sm', 'text-gray-500', ...linkable]"
          @click="() => handleClick(index)"
        >
          {{ part }}
        </button>

        <!-- 分隔符號 -->
        <span class="text-gray-400 select-none">></span>
      </template>
    </nav>
    <div class="mt-2 mb-4 gap-1 flex items-center">
      <span class="text-xl font-bold">Contents Layout</span>
      <span :class="[...linkable]">
        <SvgIcon name="copy" :class-name="['size-5']" />
      </span>
    </div>
  </div>
</template>
