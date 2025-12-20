<script setup lang="ts">
import { useUiStore } from '@site/stores/ui';
import { storeToRefs } from 'pinia';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';

const uiStore = useUiStore();
const { isSidebarPinned, sidebarWidth } = storeToRefs(uiStore);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');

const MIN_WIDTH = 100;

const isDrawerVisible = ref(false);

const showPinnedSidebar = computed(() => isSidebarPinned.value && !isMobile.value);

const sidebarWidths = computed({
  get: () => ({ sidebar: sidebarWidth.value }),
  set: (val) => uiStore.setSidebarWidth(val.sidebar),
});
</script>

<template>
  <div class="flex h-screen text-sm overflow-hidden bg-surface-50">
    <!-- Floating Sidebar (Drawer) -->
    <Drawer v-model:visible="isDrawerVisible" class="!w-72">
      <template #closebutton>
        <span></span>
      </template>
      <template #header>
        <div class="flex items-center justify-between w-full">
          <span class="text-xl font-semibold">
            FLAT <span class="text-primary">STORAGE</span>
          </span>
          <Button
            v-if="!isMobile"
            icon="pi pi-thumbtack"
            variant="text"
            severity="secondary"
            class="w-full"
            @click="
              uiStore.toggleSidebarPin();
              isDrawerVisible = false;
            "
          />
        </div>
      </template>
      <div class="flex flex-col h-full -mx-3">
        <SidebarMenu />
      </div>
    </Drawer>

    <!-- if sidebar is pinned-->
    <template v-if="showPinnedSidebar">
      <SplitterPx v-model:widths="sidebarWidths">
        <SplitterPxPanel
          id="sidebar"
          :size="sidebarWidths.sidebar"
          :min-size="MIN_WIDTH"
          show-handle
        >
          <div
            class="flex flex-col h-screen bg-white shadow-sm border-r border-surface"
          >
            <div class="p-4 flex items-center justify-between">
              <span class="text-xl font-semibold">
                FLAT <span class="text-primary">STORAGE</span>
              </span>
              <Button
                icon="pi pi-thumbtack"
                variant="text"
                severity="secondary"
                rounded
                @click="uiStore.toggleSidebarPin()"
                v-tooltip.bottom="'Unpin Sidebar'"
              />
            </div>
            <div class="flex-1 overflow-y-auto">
              <SidebarMenu />
            </div>
          </div>
        </SplitterPxPanel>

        <div class="w-full m-4 overflow-y-hidden">
          <RouterView />
        </div>
      </SplitterPx>
    </template>

    <!-- if sidebar is not pinned (or on mobile) -->
    <template v-else>
      <div class="w-full md:px-16 m-4 flex flex-col md:flex-row gap-2 overflow-hidden overflow-y-auto">
        <div class="flex-shrink-0">
          <Button
            icon="pi pi-bars"
            variant="outlined"
            severity="secondary"
            @click="isDrawerVisible = true"
          />
        </div>
        <div class="flex-1">
          <RouterView />
        </div>
      </div>
    </template>
  </div>
</template>
