<script setup lang="ts">
const { prefix, name, className } = defineProps({
  prefix: {
    type: String,
    default: 'icon',
  },
  name: {
    type: String,
    default: '',
  },
  className: {
    type: [Array<String>, String],
    default: '',
  },
});

const resolvedClassName = computed(() => {
  if (isArray(className)) {
    return className.join(' ');
  } else if (isString(className)) {
    return className;
  } else {
    return '';
  }
});

const classes = computed(() => [resolvedClassName.value, 'shrink-0'].join(' '));

const symbolId = computed(() => `#${prefix}-${name}`);
</script>

<template>
  <svg aria-hidden="true" :class="classes">
    <use :href="symbolId" />
  </svg>
</template>
