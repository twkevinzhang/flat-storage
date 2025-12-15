<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    name?: string;
    fullname?: string | undefined;
    color?: string;
    size?: 'large' | 'medium' | undefined;
    class?: any;
  }>(),
  {
    color: 'grey',
    size: 'medium',
  }
);

const classes = computed(() => {
  const { fullname, name } = props;
  return ['pi', fullname ?? `pi-${name}`, 'shrink-0', props.class].join(' ');
});
const fontSize = computed(() => {
  switch (props.size) {
    case 'large':
      return '1.5rem';
    default:
      return '1.rem';
  }
});
const theStyle = computed(() => ({
  color: props.color,
  fontSize: fontSize.value,
}));
</script>

<template>
  <i aria-hidden="true" :class="classes" v-bind:style="theStyle"></i>
</template>
