<script setup lang="ts">
import { type ButtonProps } from 'primevue/button';
interface Props extends /* @vue-ignore */ ButtonProps {
  severity?: 'list-item' | 'link' | 'compact' | undefined;
  label?: string | undefined;
  icon?: string | undefined;
  suffixIcon?: string | undefined;
}
const props = withDefaults(defineProps<Props>(), {
  severity: 'list-item',
});
const emits = defineEmits(['click']);

const internalClasses = computed(() => {
  let base = 'cursor-pointer transition-all duration-150 flex gap-2';

  if (props.severity === 'link') {
    base += ' hover:text-blue-600 hover:underline';
  } else if (props.severity === 'list-item') {
    base += ' hover:bg-gray-200/50 hover:rounded-lg';
    // base += ' p-1';
    base += ' items-center gap-3 p-2';
  } else if (props.severity === 'compact') {
    base += ' hover:bg-gray-200/50 hover:rounded-lg';
  }
  return base;
});

const classes = computed(() => {
  return [internalClasses.value, props.class];
});
</script>
<template>
  <div :class="classes" @click="(e) => emits('click', e)">
    <PrimeIcon v-if="icon" :fullname="icon" />
    <slot>
      <span>{{ label }}</span>
    </slot>
    <PrimeIcon v-if="suffixIcon" :fullname="suffixIcon" />
  </div>
</template>
