<script setup lang="ts">
const { className, variant } = defineProps({
  className: {
    type: [String, Array<String>],
    default: '',
  },
  variant: {
    type: String as () => 'invisible' | 'link',
    default: 'invisible',
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

const variantClass = computed(() => {
  if (variant === 'invisible') {
    return 'p-1 hover:bg-gray-200/50 hover:rounded-lg cursor-pointer transition-colors duration-150';
  } else if (variant === 'link') {
    return 'hover:text-blue-600 hover:underline cursor-pointer transition-colors duration-150';
  } else {
    return '';
  }
});

const classes = computed(() =>
  [variantClass.value, resolvedClassName.value].join(' ')
);
</script>
<template>
  <div :class="classes" @click="(e) => emits('click', e)">
    <slot />
  </div>
</template>
