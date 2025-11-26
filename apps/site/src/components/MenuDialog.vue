<script setup lang="ts">
import { type DialogProps } from 'primevue/dialog';

interface Item {
  label: string;
  icon?: string;
  click?: (item: Item, e: PointerEvent) => void;
}
interface Props extends /* @vue-ignore */ DialogProps {
  items: Item[];
}
defineProps<Props>();
</script>

<template>
  <Dialog modal pt:root:class="w-md h-3/4">
    <Hover
      v-for="item in items"
      :label="item.label"
      severity="list-item"
      :icon="item.icon"
      @click="(e) => item?.click?.(item, e)"
    />
  </Dialog>
</template>
