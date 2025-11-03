<script setup lang="ts">
import { mockFiles } from '@site/models';
</script>

<template>
  <div class="flex-1 px-4">
    <FileList :files="mockFiles()" />
  </div>
</template>
