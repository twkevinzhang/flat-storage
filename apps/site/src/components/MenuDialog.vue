<script setup lang="ts">
import { type DialogProps } from 'primevue/dialog';
import { MenuItem } from 'primevue/menuitem';
interface Props extends /* @vue-ignore */ DialogProps {
  items: MenuItem[];
}
defineProps<Props>();
</script>

<template>
  <Dialog modal pt:root:class="w-md h-3/4">
    <Hover
      v-for="item in items"
      :label="item.label"
      :icon="item.icon"
      @click="(e) => item.command?.({ originalEvent: e, item })"
    />
  </Dialog>
</template>
