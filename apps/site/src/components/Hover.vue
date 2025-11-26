<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    severity?: 'list-item' | 'button' | 'link' | 'compact' | undefined;
    label?: string | undefined;
    icon?: string | undefined;
    suffixIcon?: string | undefined;
    position?: 'left' | 'right' | 'center' | undefined;
    active?: boolean | undefined;
    class?: any;
  }>(),
  {
    severity: 'list-item',
    position: 'center',
    active: false,
  }
);
const emits = defineEmits(['click']);

const internalClasses = computed(() => {
  let base = 'cursor-pointer transition-all duration-150 rounded-lg flex gap-2';

  if (props.severity === 'link') {
    base += ' hover:text-blue-600 hover:underline';
  } else if (props.severity === 'list-item') {
    base += ' hover:bg-gray-200/50';
    base += ' gap-4 p-2';
    base += ' w-full';
  } else if (props.severity === 'compact') {
    base += ' hover:bg-gray-200/50';
  } else if (props.severity === 'button') {
    base += ' hover:bg-gray-200';
    base += ' px-2';
  }

  if (props.position === 'left') base += ' items-start';
  else if (props.position === 'right') base += ' items-end';
  else if (props.position === 'center') base += ' items-center';

  if (props.active) base += ' bg-gray-700';

  return base;
});

const classes = computed(() => {
  return [internalClasses.value, props.class];
});
</script>
<template>
  <Button v-slot="slotProps" asChild>
    <button
      v-bind="slotProps.a11yAttrs"
      :class="classes"
      @click="(e) => emits('click', e)"
    >
      <PrimeIcon v-if="icon" :fullname="icon" />
      <slot>
        <span>{{ label }}</span>
      </slot>
      <PrimeIcon v-if="suffixIcon" :fullname="suffixIcon" />
    </button>
  </Button>
</template>
