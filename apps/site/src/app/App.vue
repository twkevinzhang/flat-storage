<script setup lang="ts">
import { UploadManager } from '@site/services/upload-manager';

// 初始化 UploadManager
onMounted(() => {
  UploadManager.getInstance();
});
</script>

<template>
  <RouterView />
  <AppDialog />
  <UploadProgress />
  <Toast />
</template>
