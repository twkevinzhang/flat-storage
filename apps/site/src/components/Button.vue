<script setup lang="ts">
const { iconName, variant, size, className } = defineProps({
  iconName: {
    type: String,
    default: 'cross',
  },
  size: {
    type: String as () => 'sm' | 'md' | 'lg' | 'auto',
    default: 'auto',
  },
  variant: {
    type: String as () => 'default' | 'primary' | 'danger',
    default: 'default',
  },
  className: {
    type: Array<String>,
    default: [],
  },
});

const emits = defineEmits(['click']);

const resolvedClassName = computed(() => {
  if (isArray(className)) {
    return className.join(' ');
  } else if (isString(className)) {
    return className;
  } else {
    return '';
  }
});

const sizeClass = computed(() => {
  switch (size) {
    case 'sm':
      return 'size-7';
    case 'lg':
      return 'size-10';
    case 'auto':
      return '';
    default:
      return 'size-9';
  }
});

const iconClass = computed(() => {
  switch (size) {
    case 'sm':
      return 'size-3';
    case 'lg':
      return 'size-7';
    default:
      return 'size-5';
  }
});

// Primer-like variant styles
const variantClass = computed(() => {
  switch (variant) {
    case 'primary':
      return [
        'bg-sky-600 border border-sky-700 text-white',
        'hover:bg-sky-700 hover:border-sky-800',
        'focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1',
        'active:bg-sky-800 shadow-sm',
      ].join(' ');
    case 'danger':
      return [
        'bg-rose-600 border border-rose-700 text-white',
        'hover:bg-rose-700 hover:border-rose-800',
        'focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1',
        'active:bg-rose-800 shadow-sm',
      ].join(' ');
    default:
      return [
        'bg-slate-50 border border-slate-200 text-gray-700 shadow-sm',
        'hover:bg-slate-100 hover:border-slate-300',
        'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-sky-500',
        'active:bg-slate-200',
      ].join(' ');
  }
});

const classes = computed(() =>
  [
    'inline-flex items-center justify-center rounded-xl transition-colors duration-150 ease-in-out',
    'focus:outline-none',
    'cursor-pointer',
    sizeClass.value,
    variantClass.value,
    resolvedClassName.value,
  ].join(' ')
);
</script>

<template>
  <Hover :class="classes" @click="$emit('click')">
    <slot>
      <SvgIcon :name="iconName" :class-name="[iconClass]" />
    </slot>
  </Hover>
</template>
