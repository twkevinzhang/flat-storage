<script setup lang="ts">
const props = defineProps<{
  name: string;
  color?: string;
  class?: any;
}>();

const symbolId = computed(() => `#icon-${props.name}`);
</script>

<template>
  <svg
    aria-hidden="true"
    :class="props.class"
    :style="color ? `fill: ${color};` : ''"
  >
    <use :href="symbolId" />
  </svg>
</template>
