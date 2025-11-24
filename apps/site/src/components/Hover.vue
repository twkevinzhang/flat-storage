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
  let base = 'cursor-pointer transition-all duration-150';

  if (props.severity === 'link') {
    base += ' hover:text-blue-600 hover:underline';
  } else if (props.severity === 'list-item') {
    base += ' hover:bg-gray-200/50 hover:rounded-lg';
    // base += ' p-1';
    base += ' flex items-center gap-3 p-2';
  } else if (props.severity === 'compact') {
    base += ' hover:bg-gray-200/50 hover:rounded-lg  gap-1';
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
    <slot v-if="severity === 'list-item'">
      <span class="flex-grow">
        {{ label }}
      </span>
    </slot>
    <slot v-if="severity === 'link'">
      {{ label }}
    </slot>
    <slot v-if="severity === 'compact'">
      {{ label }}
    </slot>
    <PrimeIcon v-if="suffixIcon" :fullname="suffixIcon" />
  </div>
</template>
