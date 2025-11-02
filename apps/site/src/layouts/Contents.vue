<script setup lang="ts">
import { mockFiles } from '@site/models';

</script>

<template>
  <div class="flex-1 p-6">
    <span class="text-3xl font-bold mb-4">Contents Layout</span>
    <FileList :files="mockFiles()" />
  </div>
</template>
