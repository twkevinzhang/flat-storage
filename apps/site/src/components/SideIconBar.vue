<script setup lang="ts">
interface Item {
  id: string;
  label?: string;
  icon?: string;
}

const { items } = defineProps<{
  items: Item[];
  activeItemId: string | null;
}>();

const emits = defineEmits<{
  (e: 'click', item: Item, event: PointerEvent): void;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center min-w-14 bg-gray-900 text-white py-2 space-y-2"
  >
    <Hover
      v-for="item in items"
      :key="item.id"
      @click="(e) => emits('click', item, e)"
      severity="button"
      :active="activeItemId === item.id"
      class="p-2 size-10 hover:bg-gray-700"
      :label="item.label"
    >
      <slot :item="item"></slot>
    </Hover>
  </div>
</template>
