<script setup lang="ts">
import { useSelectModeStore } from '@site/stores/select-mode';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

const selectModeStore = useSelectModeStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');

function handleMove() {
  // TODO: 實作移動功能
}

function handleDownload() {
  // TODO: 實作下載功能
}

function handleAddToFavorites() {
  // TODO: 實作新增到最愛
}

function handleLock() {
  // TODO: 實作上鎖
}

function handleDelete() {
  // TODO: 實作刪除
}

function handleCancel() {
  selectModeStore.exitSelectMode();
}

// 共用的操作按鈕定義
const safeActionButtons = [
  {
    icon: 'pi pi-folder-open',
    label: '移動',
    handler: handleMove,
  },
  {
    icon: 'pi pi-download',
    label: '下載',
    handler: handleDownload,
  },
  {
    icon: 'pi pi-star',
    label: '新增到最愛',
    handler: handleAddToFavorites,
  },
  {
    icon: 'pi pi-lock',
    label: '上鎖',
    handler: handleLock,
  },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="selectModeStore.selectMode && selectModeStore.selectionsCount > 0"
        class="fixed bottom-0 left-0 right-0 bg-black text-white z-50"
        :class="isMobile ? 'py-3' : 'py-4'"
      >
        <div class="container mx-auto px-4">
          <!-- 桌面版 -->
          <div v-if="!isMobile" class="flex items-center justify-between">
            <!-- 左側：已選數量 + 安全操作 -->
            <div class="flex items-center gap-3">
              <span class="font-semibold">
                已選擇 {{ selectModeStore.selectionsCount }} 項
              </span>
              <div class="h-6 w-px bg-white/30"></div>
              <Button
                v-for="btn in safeActionButtons"
                :key="btn.icon"
                :icon="btn.icon"
                :label="btn.label"
                variant="outlined"
                severity="secondary"
                @click="btn.handler"
              />
            </div>

            <!-- 右側：危險操作 + 取消 -->
            <div class="flex items-center gap-3">
              <div class="h-6 w-px bg-white/30"></div>
              <Button
                icon="pi pi-trash"
                label="刪除"
                severity="danger"
                variant="text"
                class="text-red-300 hover:text-red-100"
                @click="handleDelete"
              />
              <div class="h-6 w-px bg-white/30"></div>
              <Button
                icon="pi pi-times"
                label="取消"
                severity="secondary"
                variant="text"
                @click="handleCancel"
              />
            </div>
          </div>

          <!-- 手機版：水平滾動 -->
          <div v-else class="flex items-center gap-2">
            <!-- 已選數量（固定在左側） -->
            <span class="font-semibold text-sm whitespace-nowrap">
              {{ selectModeStore.selectionsCount }} 項
            </span>

            <!-- 可滾動按鈕區域 -->
            <div
              class="flex-1 overflow-x-auto flex items-center gap-2 scrollbar-hide"
            >
              <Button
                v-for="btn in safeActionButtons"
                :key="btn.icon"
                :icon="btn.icon"
                :aria-label="btn.label"
                variant="outlined"
                severity="secondary"
                size="small"
                class="text-white flex-shrink-0"
                @click="btn.handler"
              />
              <div class="h-6 w-px bg-white/30 flex-shrink-0"></div>
              <Button
                icon="pi pi-trash"
                severity="danger"
                variant="text"
                size="small"
                aria-label="刪除"
                class="text-red-300 flex-shrink-0"
                @click="handleDelete"
              />
            </div>

            <!-- 取消按鈕（固定在右側） -->
            <Button
              icon="pi pi-times"
              severity="secondary"
              variant="text"
              size="small"
              aria-label="取消"
              class="text-white flex-shrink-0"
              @click="handleCancel"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* 隱藏手機版滾動條 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
