<script setup lang="ts">
const props = defineProps<{
  path: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', newPath: string): void;
}>();

const path = computed(() => {
  let r = props.path
  if (isEmpty(r)) {
    r = '/';
  }
  if (!r.startsWith('/')) {
    r = '/' + r
  }
  if (r.endsWith('/')) {
    r = r.slice(0, -1);
  }
  return r;
})

const parts = computed(() => {
  const a = path.value.split('/').slice(1, -1); // 最後一個 part 不顯示
  a.unshift('/');
  return a;
});

const handleClick = (index: number) => {
  const newPath = take(parts.value, index + 1).join('/');
  emit('navigate', newPath);
};
</script>

<template>
  <nav class="px-2 flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-normal">
    <template v-for="(part, index) in parts" :key="index">
      <Hover severity="link" :fluid="false" @click="() => handleClick(index)" :label="part" />

      <PrimeIcon name="angle-right" />
    </template>
  </nav>
</template>
