<script setup lang="ts">
import { useFilesStore } from '@site/stores/files';
import { useRoute } from 'vue-router';

const store = useFilesStore();
const route = useRoute();
const { setFilter } = store;

watch(
  () => route,
  (newRoute) => {
    setFilter(newRoute.query);
  },
  { deep: true, immediate: true }
);
</script>
<template>
  <RouterView />
</template>
