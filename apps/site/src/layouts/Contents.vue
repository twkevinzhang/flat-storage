<script setup lang="ts">
import { mockFiles } from '@site/models';

const openSettings = ref(false);
</script>

<template>
  <div class="mx-4 mt-4">
    <Breadcrumb
      :path="'yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy'"
    />
    <div class="mt-2 mb-3 gap-1 flex justify-between items-center">
      <span class="text-xl font-bold break-all">
        ContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContents
        Layout
      </span>
      <div>
        <Button
          @click="(e) => (openGridConfig = true)"
          aria-label="Filter"
          variant="text"
          rounded
          size="large"
          class="pi pi-eye"
        />
      </div>
    </div>
  </div>

  <div class="flex-1 px-4">
    <FileList :files="mockFiles()" />
  </div>

  <GridConfigDialog :open="openSettings" @close="openSettings = false" />
</template>
