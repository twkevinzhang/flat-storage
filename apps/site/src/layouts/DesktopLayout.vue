<script setup lang="ts">
import { useMouse, useMousePressed } from '@vueuse/core';

// --- 侧边栏图标和状态逻辑 (保持不变) ---

const SidebarIconList = [
  { id: 'explorer', icon: '📁', label: 'Explorer' },
  { id: 'starred', icon: '⭐', label: 'Starred' },
  { id: 'history', icon: '⏱️', label: 'History' },
];
const activeItemId = ref<string | null>(SidebarIconList[0].id);
const sidebarOpen = computed(() => activeItemId.value !== null);

function setActive(id: string) {
  if (activeItemId.value === id) {
    activeItemId.value = null;
  } else {
    activeItemId.value = id;
  }
}

const INITIAL_WIDTH = 256;
const MIN_WIDTH = 100;
const MAX_WIDTH = 500;

const sidebarWidth = ref(INITIAL_WIDTH);
const { x } = useMouse();
const draggerRef = ref<HTMLElement | null>(null);
const { pressed } = useMousePressed({ target: draggerRef });

let startX = 0;
let startWidth = INITIAL_WIDTH;

watch(pressed, (isPressed) => {
  if (isPressed) {
    startX = x.value;
    startWidth = sidebarWidth.value;
  }
});

watch(x, (currentX) => {
  if (pressed.value) {
    const dx = currentX - startX;
    let newWidth = startWidth + dx;

    newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    sidebarWidth.value = newWidth;
  }
});
</script>

<template>
  <div class="flex h-screen text-sm">
    <SideIconBar
      :items="SidebarIconList"
      :active-item-id="activeItemId"
      @click="(item, e) => setActive(item.id)"
    >
      <template #default="{ item }">
        <span class="text-2xl">{{ item.icon }}</span>
      </template>
    </SideIconBar>

    <template v-if="sidebarOpen">
      <div
        :style="{ width: sidebarWidth + 'px' }"
        class="flex flex-col transition-all duration-0"
      >
        <slot name="sidebar" :icon="activeItemId" />
      </div>

      <div
        ref="draggerRef"
        class="w-2 cursor-col-resize hover:bg-gray-700 bg-gray-200 transition-colors duration-200"
      ></div>
    </template>

    <div class="flex-1 overflow-auto">
      <slot name="content" />
    </div>
  </div>
</template>
