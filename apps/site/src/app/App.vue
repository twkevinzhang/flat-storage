<script setup lang="ts">
import { useFilesStore } from '@site/stores/files';
import { storeToRefs } from 'pinia';

const store = useFilesStore();
const { filteredFiles } = storeToRefs(store);
</script>

<template>
  <DesktopLayout>
    <template v-slot:sidebar>
      <ExplorerBar :entities="filteredFiles" />
    </template>
    <template v-slot:content>
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </template>
  </DesktopLayout>
  <AppDialog />
</template>
