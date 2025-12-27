<script setup lang="ts">
import { useDownloadStore } from '@site/stores/download';
import { useUploadStore } from '@site/stores/upload';
import { breakpointsTailwind } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');

const uploadStore = useUploadStore();

/**
 * beforeunload 警告 - 防止用戶在上傳時意外關閉頁面
 */
function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (uploadStore.hasActiveUploads) {
    event.preventDefault();
    // 現代瀏覽器會忽略自訂訊息，顯示標準警告
    event.returnValue = '';
    return '';
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

/**
 * 請求通知權限（首次進入時）
 */
onMounted(async () => {
  // 延遲 2 秒後請求通知權限，避免過於突兀
  setTimeout(async () => {
    if (uploadStore.notificationPermission === 'default') {
      await uploadStore.requestNotificationPermission();
    }
  }, 2000);
});

/**
 * Download state
 */
const downloadStore = useDownloadStore();
const downloadStoreRefs = storeToRefs(downloadStore);
</script>
<template>
  <div
    :class="[
      'fixed bg-white dark:bg-surface-900 shadow-2xl rounded-lg border border-surface-200 dark:border-surface-700 z-50',
      isMobile
        ? 'right-2 bottom-2 w-full max-w-[calc(100vw-1rem)]'
        : 'right-4 bottom-4 w-[600px] max-w-[calc(100vw-2rem)]',
    ]"
  >
    <UploadProgress />
    <DownloadProgress
      :failedTasks="downloadStoreRefs.failedTasks.value"
      :downloadingTasks="downloadStoreRefs.downloadingTasks.value"
      :completedTasks="downloadStoreRefs.completedTasks.value"
      :totalProgress="downloadStoreRefs.totalProgress.value"
      :isCollapsed="downloadStoreRefs.isCollapsed.value"
      :isMobile="isMobile"
      :tasks="downloadStoreRefs.tasks.value"
      @pause="downloadStore.pauseTask"
      @resume="downloadStore.resumeTask"
      @retry="downloadStore.retryTask"
      @remove="downloadStore.removeTask"
      @clearCompleted="downloadStore.clearCompleted"
      @retryAll="downloadStore.retryAll"
      @toggleCollapse="downloadStore.toggleCollapse"
    />
  </div>
</template>
