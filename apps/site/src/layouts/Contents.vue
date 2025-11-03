<script setup lang="ts">
import { mockFiles } from '@site/models';
</script>

<template>
  <div class="flex-1 px-4">
    <div class="text-3xl font-bold my-4">Contents Layout</div>
    <FileList :files="mockFiles()" />
  </div>
</template>
