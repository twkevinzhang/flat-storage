<script setup lang="ts">
const { prefix, name, className } = withDefaults(
  defineProps<{
    prefix?: string;
    name: string;
    className?: string[];
  }>(),
  {
    prefix: 'icon',
    name: '',
    className: () => [],
  }
);
const symbolId = computed(() => `#${prefix}-${name}`);
</script>

<template>
  <svg aria-hidden="true" :class="[...className, 'shrink-0']">
    <use :href="symbolId" />
  </svg>
</template>
