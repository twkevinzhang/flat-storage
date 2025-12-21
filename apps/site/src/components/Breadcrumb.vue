<script setup lang="ts">
const props = defineProps<{
  path: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', newPath: string): void;
}>();

const path = computed(() => {
  let r = props.path;
  if (r.startsWith('/')) {
    r = r.slice(1);
  }
  if (r.endsWith('/')) {
    r = r.slice(0, -1);
  }
  return r;
});

const parts = computed(() => path.value.split('/').slice(0, -1)); // 最後一個 part 不顯示

const handleClick = (index: number) => {
  const newPath = take(parts.value, index + 1).join('/');
  emit('navigate', newPath);
};
</script>

<template>
  <nav
    class="p-2 flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-normal"
  >
    <template v-for="(part, index) in parts" :key="index">
      <Hover
        severity="link"
        paddingSize="none"
        :fluid="false"
        @click="() => handleClick(index)"
        :label="part"
      />

      <PrimeIcon name="angle-right" />
    </template>
  </nav>
</template>
