<script setup lang="ts">
const { prefix, name, style } = defineProps<{
  prefix?: string;
  name: string;
  style?: Record<string, string>;
  className?: string[];
}>();
const symbolId = computed(() => `#${prefix ?? 'icon'}-${name}`);
</script>

<template>
  <svg aria-hidden="true" :style="style" :class="className">
    <use :href="symbolId" />
  </svg>
</template>
