<script setup lang="ts">
import { useSelectModeStore } from '@site/stores/select-mode';
import { useDownloadStore } from '@site/stores';
import { useMetadataStore } from '@site/stores';
import { DownloadTaskFile, expandSelections } from '@site/models';
import { ObjectEntity } from '@site/models';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { useSessionStore } from '@site/stores';

const sessionStore = useSessionStore();
const selectModeStore = useSelectModeStore();
const downloadStore = useDownloadStore();
const metadataStore = useMetadataStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');
const route = useRoute();
const sessionId = computed(() => (route.params as any).sessionId as string);
const session = computed(() => sessionStore.get(sessionId.value));

function handleMove() {
  // TODO: 實作移動功能
}

function handleDownload() {
  downloadStore.setSession(session.value!);

  // Get selected entities
  const selectedEntities = Array.from(selectModeStore.selectionKeys)
    .map((key) => selectModeStore.items.find((item) => item.key === key))
    .filter(Boolean)
    .filter((e) => e && !e.isFolder);

  if (isEmpty(selectedEntities)) {
    return;
  }

  // Get all entities for folder expansion
  const allEntities = metadataStore.allObjects;
  console.log('所有實體數量:', allEntities.length);

  // Create download tasks
  const tasks: DownloadTaskFile[] = selectedEntities.map(
    ({ entity, relativePath }) => ({
      name: entity.path.name,
      path: entity.path.toSegmentsString(),
      size: entity.sizeBytes || 0,
      relativePath,
    })
  );

  console.log('建立的下載任務:', tasks);
  tasks.forEach((file) => downloadStore.addTask(file));
  console.log(
    '下載任務已加入 store，當前任務數量:',
    downloadStore.tasks.length
  );

  // Exit select mode
  selectModeStore.exitSelectMode();
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
    icon: 'pi pi-download',
    label: '下載',
    handler: handleDownload,
  },
  {
    icon: 'pi pi-folder-open',
    label: '移動',
    handler: handleMove,
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
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-300 ease-in"
      enter-from-class="translate-y-full"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="selectModeStore.selectMode && selectModeStore.selectionsCount > 0"
        class="fixed bottom-0 left-0 right-0 text-white z-50 bg-sky-500"
        :class="isMobile ? 'py-3' : 'py-4'"
      >
        <div class="container mx-auto px-4">
          <DesktopSelectModeActionBar
            v-if="!isMobile"
            :selections-count="selectModeStore.selectionsCount"
            :safe-action-buttons="safeActionButtons"
            :on-delete="handleDelete"
            :on-cancel="handleCancel"
          />

          <MobileSelectModeActionBar
            v-else
            :selections-count="selectModeStore.selectionsCount"
            :safe-action-buttons="safeActionButtons"
            :on-delete="handleDelete"
            :on-cancel="handleCancel"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
