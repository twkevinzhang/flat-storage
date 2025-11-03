<script setup lang="ts">
import { FileEntity } from '@site/models';

const { files } = defineProps<{
  files: FileEntity[];
}>();

const linkable = ['hover:text-blue-600', 'hover:underline', 'cursor-pointer'];
</script>

<template>
  <div class="w-full overflow-x-scroll">
    <!-- 標題列 -->
    <div
      class="flex items-center justify-between gap-4 px-4 py-2 border border-gray-200 rounded-t-lg bg-gray-200/50"
    >
      <div class="min-w-24 flex-1">名稱</div>
      <div class="w-32">大小</div>
      <div class="w-32">種類</div>
      <div class="w-40">最後修改日期</div>
    </div>

    <!-- 檔案列 -->
    <div
      v-for="file in files"
      :key="file.name"
      class="flex items-center justify-between gap-4 px-4 py-2 border-b border-x border-gray-200 last:rounded-b-lg hover:bg-gray-200/50 transition"
    >
      <div class="min-w-24 flex-1 flex flex-row gap-2">
        <SvgIcon
          v-if="file.isFolder"
          name="folder"
          :class-name="['size-5', 'text-blue-500']"
        />
        <SvgIcon
          v-else
          name="file-question-alt-1"
          :class-name="['size-5', 'text-blue-500']"
        />
        <span :class="['break-all', ...linkable]">{{ file.name }}</span>
      </div>

      <span class="w-32 text-gray-500 text-right">{{
        file.sizeFormatted
      }}</span>
      <span class="w-32 text-gray-500">{{ file.mimeType }}</span>
      <span class="w-40 text-gray-500">{{ file.modifiedAtFormatted }}</span>
    </div>
  </div>
</template>
