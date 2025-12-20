<template>
  <Menu
    :model="[
      {
        separator: true,
      },
      {
        items: [
          {
            label: 'Recent',
            icon: 'pi pi-clock',
          },
          {
            label: 'Search',
            icon: 'pi pi-search',
          },
        ],
      },
      {
        label: 'Favorite',
        items: [
          {
            label: 'Item1',
            icon: 'pi pi-folder',
            shortcut: '⌘+0',
          },
          {
            label: 'Item2',
            icon: 'pi pi-folder',
            shortcut: '⌘+1',
          },
          {
            label: 'Item3',
            icon: 'pi pi-folder',
            shortcut: '⌘+2',
          },
        ],
      },
    ]"
    class="!border-none w-full"
  >
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.shortcut"
          class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
        >
          {{ item.shortcut }}
        </span>
      </a>
    </template>
  </Menu>
</template>
