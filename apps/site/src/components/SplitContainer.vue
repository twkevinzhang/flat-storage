<script setup lang="ts">
import { useMouse, useMousePressed } from '@vueuse/core';

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
  <div class="flex h-screen text-sm overflow-x-hidden">
    <div :style="{ width: sidebarWidth + 'px' }">
      <slot name="left" />
    </div>

    <div
      ref="draggerRef"
      class="w-2 cursor-col-resize hover:bg-gray-700 bg-gray-200 transition-colors duration-200"
    ></div>
    <div class="flex-1 overflow-auto">
      <slot name="right" />
    </div>
  </div>
</template>
