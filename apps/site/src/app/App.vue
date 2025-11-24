<script setup lang="ts">
import { mockFiles } from '@site/models';
</script>

<template>
  <DesktopLayout>
    <template v-slot:sidebar>
      <ExplorerBar :entities="mockFiles()" />
    </template>
    <template v-slot:content>
      <RouterView v-slot="{ Component }">
        <component :is="Component" />
      </RouterView>
    </template>
  </DesktopLayout>
</template>
