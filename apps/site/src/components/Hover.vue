<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    severity?:
      | 'list-item'
      | 'button'
      | 'link'
      | 'compact'
      | 'compact-split-left'
      | 'compact-split-right'
      | undefined;
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
  let base = 'cursor-pointer transition-all duration-150 flex gap-2';

  if (props.severity === 'link') {
    base += ' hover:text-blue-600 hover:underline';
    base += ' rounded-lg';
  } else if (props.severity === 'list-item') {
    base += ' hover:bg-gray-200/50';
    base += ' gap-4 p-2 rounded-lg w-full';
  } else if (props.severity === 'button') {
    base += ' hover:bg-gray-200';
    base += ' px-2 rounded-lg';
  } else if (props.severity === 'compact') {
    base += ' hover:bg-gray-200/50';
    base += ' gap-1 rounded-lg p-2';
  } else if (props.severity === 'compact-split-left') {
    base += ' hover:bg-gray-200/50';
    base += ' gap-1 rounded-l-lg pl-2 pr-[4px] py-2 justify-end';
  } else if (props.severity === 'compact-split-right') {
    base += ' hover:bg-gray-200/50';
    base += ' gap-1 rounded-r-lg pl-[4px] pr-2 py-2 justify-start';
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
        <span v-if="!isEmpty(label)">{{ label }}</span>
      </slot>
      <PrimeIcon v-if="suffixIcon" :fullname="suffixIcon" />
    </button>
  </Button>
</template>
