<script setup lang="ts">
// UploadManager 已整合到 useUploadStore
// 佇列處理由 store 內部的 useIntervalFn 自動啟動
</script>

<template>
  <RouterView />
  <AppDialog />
  <UploadProgress />
  <Toast />
</template>
