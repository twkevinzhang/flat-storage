<script setup lang="ts">
const { name, color, size } = defineProps({
  name: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'grey',
  },
  size: {
    type: String,
    default: '',
  },
});

const theClasses = computed(() => ['pi', `pi-${name}`, 'shrink-0'].join(' '));
const theFontSize = computed(() => {
  switch (size) {
    case 'large':
      return '1.5rem';
    default:
      return '1.rem';
  }
});
const theStyle = computed(() => ({
  color,
  fontSize: theFontSize,
}));
</script>

<template>
  <i aria-hidden="true" :class="theClasses" v-bind:style="theStyle"></i>
</template>
