<script setup lang="ts">
</script>

<template>
  <SplitContainer>
    <template #left>
      <div class="p-2 h-screen overflow-y-auto">
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
        class="!border-none w-full flex-1"
      >
        <template #start>
          <span class="inline-flex items-center gap-1 px-2 py-2">
            <span class="text-xl font-semibold">
              FLAT
              <span class="text-primary">STORAGE</span>
            </span>
          </span>
        </template>
        <template #submenulabel="{ item }">
          <span class="font-bold">{{ item.label }}</span>
        </template>
        <template #item="{ item, props }">
          <a v-ripple class="flex items-center" v-bind="props.action">
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
            <span
              v-if="item.shortcut"
              class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
              >{{ item.shortcut }}</span
            >
          </a>
        </template>
      </Menu>
      </div>
    </template>
    <template #right>
      <RouterView />
    </template>
  </SplitContainer>
</template>
