<script setup lang="ts">
import { type ButtonProps } from 'primevue/button';
interface Props extends /* @vue-ignore */ ButtonProps {
  severity?: 'invisible' | 'link' | undefined;
}
const props = withDefaults(defineProps<Props>(), {
  severity: 'invisible',
});
const emits = defineEmits(['click']);

const internalClasses = computed(() => {
  let base = 'cursor-pointer transition-all duration-150';

  if (props.severity === 'link') {
    base += 'hover:text-blue-600 hover:underline';
  } else if (props.severity === 'invisible') {
    base += ' hover:bg-gray-200/50 hover:rounded-lg';
    base += '  p-1';
  }

  return base;
});

const classes = computed(() => {
  return [internalClasses.value, props.class];
});
</script>
<template>
  <div :class="classes" @click="(e) => emits('click', e)">
    <slot />
  </div>
</template>
