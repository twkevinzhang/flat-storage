<script setup lang="ts">
import { type DialogProps } from 'primevue/dialog';
import { MenuItem } from 'primevue/menuitem';

interface Props extends /* @vue-ignore */ DialogProps {
  items: MenuItem[];
  dangerItems?: MenuItem[];
}
const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  dangerItems: () => [],
});

const dangerItems = computed(() => {
  if (props.dangerItems) {
    return [
      {
        label: 'Danger Zone',
        items: props.dangerItems,
      },
    ];
  } else {
    return props.dangerItems;
  }
});
</script>

<template>
  <Dialog modal pt:root:class="w-md h-3/4">
    <Menu :model="items" class="!border-none">
      <template #submenulabel="{ item }">
        <span class="font-bold">{{ item.label }}</span>
      </template>
      <template #item="{ item, props }">
        <Hover
          v-bind="props.action"
          :label="item.label ?? ''"
          severity="list-item"
          :icon="item.icon"
        />
      </template>
    </Menu>
    <Menu v-if="dangerItems" :model="dangerItems" class="!border-none">
      <template #submenulabel="{ item }">
        <span class="text-red-700 font-bold">{{ item.label }}</span>
      </template>
      <template #item="{ item, props }">
        <Hover
          v-bind="props.action"
          severity="list-item"
          :icon="item.icon"
          :pt="{ primeIcon: { class: '!text-red-500' } }"
        >
          <span class="text-red-700">{{ item.label }}</span>
        </Hover>
      </template>
      <div></div>
    </Menu>
  </Dialog>
</template>
