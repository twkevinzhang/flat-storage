<script setup lang="ts">
import { useUploadStore } from '@site/stores/upload';

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
</script>

<template>
  <RouterView />
  <AppDialog />
  <UploadProgress />
  <Toast />
</template>
