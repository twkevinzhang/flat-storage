<script setup lang="ts">
import { FilesFilter } from '@site/models';
import { useFilesStore } from '@site/stores/files';
import { storeToRefs } from 'pinia';
import qs from 'qs';
import { useRoute, useRouter } from 'vue-router';

const store = useFilesStore();
const router = useRouter();
const route = useRoute();
const { filter } = storeToRefs(store);
const { setFilter } = store;

const initialFilter = route.query.q
  ? FilesFilter.fromQs(route.query.q)
  : FilesFilter.empty();
setFilter(initialFilter);

watch(
  () => filter,
  (newFilter) => {
    const newQuery = newFilter.value.qs;
    if (qs.stringify(route.query as any) !== newQuery) {
      router.push({
        query: { q: newQuery },
      });
    }
  },
  { deep: true, immediate: true }
);
</script>
<template>
  <RouterView />
</template>
