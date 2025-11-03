<script setup lang="ts">
const {
  prefix,
  name,
  style,
  className = [],
} = defineProps<{
  prefix?: string;
  name: string;
  style?: Record<string, string>;
  className?: string[];
}>();
const symbolId = computed(() => `#${prefix ?? 'icon'}-${name}`);
</script>

<template>
  <svg :style="style" :class="[...className, 'shrink-0']">
    <use :href="symbolId" />
  </svg>
</template>
