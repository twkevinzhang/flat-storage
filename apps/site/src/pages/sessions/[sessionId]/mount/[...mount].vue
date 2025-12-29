<script setup lang="ts">
import { Entity } from '@site/components/ObjectTree';
import {
  ObjectEntity,
  ObjectMimeType,
  ObjectsFilter,
  EntityPath,
} from '@site/models';
import { useDialogStore } from '@site/stores';
import { pathIt, useListViewStore } from '@site/stores/list-view';
import { useSessionStore } from '@site/stores';
import { useUiStore } from '@site/stores';
import { useSelectModeStore } from '@site/stores/select-mode';
import { useMetadataStore } from '@site/stores';
import { useDownloadStore } from '@site/stores/download';
import { useUploadStore } from '@site/stores/upload';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import MountList from '@site/layouts/MountList.vue';
import MountGrid from '@site/layouts/MountGrid.vue';
import MountColumn from '@site/layouts/MountColumn.vue';

/**
 * =====
 * Data fetching and listeners
 * =====
 */

const sessionStore = useSessionStore();
const router = useRouter();
const route = useRoute();
const listViewStore = useListViewStore();
const listViewStoreRefs = storeToRefs(listViewStore);
const metadataStore = useMetadataStore();
const metadataStoreRefs = storeToRefs(metadataStore);
const selectModeStore = useSelectModeStore();
const selectModeStoreRefs = storeToRefs(selectModeStore);
const downloadStore = useDownloadStore();
const uploadStore = useUploadStore();

const path = computed(() => {
  const sessionId = (route.params as any).sessionId as string;
  const mount = (route.params as any).mount as string;
  return EntityPath.fromRoute({ sessionId, mount });
});
const session = computed(() => {
  const sessionId = (route.params as any).sessionId as string;
  return sessionStore.get(sessionId);
});

// Set session for download and upload stores when page loads
watch(
  session,
  (newSession) => {
    if (newSession) {
      downloadStore.setSession(newSession);
      uploadStore.setSession(newSession);
    }
  },
  { immediate: true }
);

watch(
  path,
  async (newPath) => {
    await metadataStore.loadObjects(session.value!);
    listViewStore.setPath(newPath);
  },
  { immediate: true }
);

watch(
  () => [route.query],
  ([newQuery]) => {
    if (newQuery) {
      listViewStore.setFilter(ObjectsFilter.fromQuery(newQuery));
    }
  },
  { immediate: true }
);

watch(
  metadataStoreRefs.allObjects,
  (newObjects) => {
    if (newObjects) {
      listViewStore.setList(newObjects);
      selectModeStore.setItems(newObjects.map(toLeafNode));
    }
  },
  { immediate: true }
);

/**
 * =====
 * Tree
 * =====
 */

const tree = ref<Entity[]>([]);

watch(
  listViewStoreRefs.statefulList,
  (newList) => {
    if (newList) {
      tree.value = newList.map(toLeafNode);
    }
  },
  { immediate: true }
);

/**
 * =====
 * Select Mode
 * =====
 */

const dialogStore = useDialogStore();
const uiStore = useUiStore();
const { viewMode } = storeToRefs(uiStore);

// 響應式斷點
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');
const isDesktop = breakpoints.greaterOrEqual('md');

// 手機版更多選單
const moreMenu = ref<any>(null);
const moreMenuItems = computed(() => [
  {
    label: '視圖模式',
    icon: 'pi pi-th-large',
    disabled: selectModeStore.selectMode,
    command: () => {
      dialogStore.open('view-mode');
    },
  },
  {
    label: '篩選',
    icon: 'pi pi-filter',
    badge: listViewStoreRefs.filterCount.value || undefined,
    command: () => {
      dialogStore.open('filter');
    },
  },
  {
    label: '排序',
    icon: 'pi pi-sort-alpha-down',
    badge: listViewStoreRefs.sortRulesCount.value || undefined,
    command: () => {
      dialogStore.open('sort');
    },
  },
  {
    label: '欄位順序',
    icon: 'pi pi-eye',
    disabled: selectModeStore.selectMode,
    command: () => {
      dialogStore.open('order');
    },
  },
]);

// 視圖模式選項 (重用)
const viewModeOptions = [
  { icon: 'th-large', name: 'Grid', value: 'grid' },
  { icon: 'list', name: 'List', value: 'list' },
  { svgIcon: 'three-columns', name: 'Column', value: 'column' },
];

// Upload 按鈕選項 (重用)
const uploadMenuModel = [
  {
    label: 'Create Folder',
    icon: 'pi pi-folder-plus',
    command: () => dialogStore.open('create-folder'),
  },
];

// 工具列按鈕配置
const toolbarButtons = {
  refresh: {
    icon: 'pi pi-refresh',
    label: '重新整理',
    handler: () => handleRefresh(),
  },
  columnOrder: {
    icon: 'pi pi-eye',
    label: '欄位順序',
    handler: () => dialogStore.open('order'),
  },
  filter: {
    icon: 'pi pi-filter',
    label: '篩選',
    handler: () => dialogStore.open('filter'),
    badge: () => listViewStoreRefs.filterCount.value,
  },
  sort: {
    icon: 'pi pi-sort-alpha-down',
    label: '排序',
    handler: () => dialogStore.open('sort'),
    badge: () => listViewStoreRefs.sortRulesCount.value,
  },
};

// 計算屬性：根據 selectMode 決定的樣式
const selectModeDisabledClass = computed(() => ({
  'pointer-events-none opacity-50': selectModeStore.selectMode,
}));

const selectModeActiveClass = computed(() => ({
  'z-50 pointer-events-auto': selectModeStore.selectMode,
}));

/**
 * =====
 * Handlers
 * =====
 */

function handleUpload() {
  dialogStore.open('upload');
}

function handleNavigate(p: EntityPath): void {
  router.push({ path: p.toRoute() });
}

function handleNodeToggle(node: Entity, newValue: boolean) {
  if (newValue && !node.children) {
    node.loading = true;

    try {
      const entities = metadataStoreRefs.allObjects.value;
      const children = pathIt(entities, node.path);
      node.children = children.map(toLeafNode);
    } finally {
      node.loading = false;
    }
  }
}

function handleNodeClick(node: Entity): void {
  if (node.leaf) {
    handleNavigate(node.path);
  }
}

function handleUp() {
  const currentPath = listViewStore.path;
  if (currentPath.isRootLevel) return;
  const parent = currentPath.parent;
  handleNavigate(parent);
}

function handleShowMoreClick() {}

function handleToggleSelection(node: Entity) {
  selectModeStore.toggleSelection(node);
}

async function handleRefresh() {
  if (!session.value) return;
  await metadataStore.refresh(session.value);
}

/**
 * =====
 * Utilities
 * =====
 */

function toLeafNode(v: ObjectEntity): Entity {
  return {
    ...v,
    key: v.path.toString(),
    label: v.name,
    leaf: v.mimeType === ObjectMimeType.folder,
    loading: false,
  } as any;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Breadcrumb (手機版和桌面版都顯示) -->
    <Breadcrumb :path="path" @navigate="(e: EntityPath) => handleNavigate(e)">
      <!-- 資料夾名稱 + 選單 -->
      <Hover class="flex-1" :fluid="false" @click="dialogStore.open('menu')">
        <span
          :class="['font-bold break-all', isDesktop ? 'text-lg' : 'text-base']"
        >
          {{ listViewStoreRefs.name.value }}
        </span>
        <PrimeIcon name="angle-down" />
      </Hover>
    </Breadcrumb>

    <!-- 工具列容器 -->
    <div :class="['flex gap-2', isDesktop ? 'flex-row gap-4' : 'flex-col']">
      <!-- 手機版：更多選單 + 操作按鈕 -->
      <div v-if="isMobile" class="flex items-center gap-2 w-full relative">
        <Menu ref="moreMenu" :model="moreMenuItems" :popup="true" />
        <!-- 更多選項按鈕 -->
        <Button
          icon="pi pi-sliders-h"
          severity="secondary"
          variant="outlined"
          aria-label="更多選項"
          class="relative z-50"
          @click="(e) => moreMenu?.toggle(e)"
        />
        <div
          class="flex items-center gap-2 flex-1"
          :class="selectModeDisabledClass"
        >
          <Button
            :icon="toolbarButtons.refresh.icon"
            severity="secondary"
            variant="outlined"
            :aria-label="toolbarButtons.refresh.label"
            @click="toolbarButtons.refresh.handler"
          />
          <SplitButton
            label="Upload"
            severity="primary"
            :model="uploadMenuModel"
            @click="handleUpload()"
          />
        </div>
      </div>

      <!-- 視圖模式選擇器（桌面版） -->
      <div v-if="isDesktop" class="flex items-center gap-3 relative">
        <SelectButton
          v-model="viewMode"
          size="small"
          option-label="name"
          option-value="value"
          :options="viewModeOptions"
        >
          <template #option="{ option }">
            <PrimeIcon v-if="option.icon" :name="option.icon" />
            <SvgIcon v-else :name="option.svgIcon" class="text-slate-500" />
          </template>
        </SelectButton>

        <!-- 桌面版：篩選排序按鈕組 -->
        <ButtonGroup v-if="isDesktop">
          <Button
            :icon="toolbarButtons.filter.icon"
            severity="secondary"
            badge-severity="contrast"
            :aria-label="toolbarButtons.filter.label"
            :badge="toolbarButtons.filter.badge()"
            @click="toolbarButtons.filter.handler"
          />
          <Button
            :icon="toolbarButtons.sort.icon"
            severity="secondary"
            badge-severity="contrast"
            :aria-label="toolbarButtons.sort.label"
            :badge="toolbarButtons.sort.badge()"
            @click="toolbarButtons.sort.handler"
          />
        </ButtonGroup>
      </div>

      <!-- 桌面版：主要操作 -->
      <div
        v-if="isDesktop"
        class="flex items-center gap-2"
        :class="selectModeDisabledClass"
      >
        <Button
          :icon="toolbarButtons.columnOrder.icon"
          severity="secondary"
          variant="outlined"
          :aria-label="toolbarButtons.columnOrder.label"
          @click="toolbarButtons.columnOrder.handler"
        />
        <Button
          :icon="toolbarButtons.refresh.icon"
          severity="secondary"
          variant="outlined"
          :aria-label="toolbarButtons.refresh.label"
          @click="toolbarButtons.refresh.handler"
        />
        <SplitButton
          label="Upload"
          severity="primary"
          :model="uploadMenuModel"
          @click="handleUpload()"
        />
      </div>
    </div>
    <!-- 視圖容器 -->
    <div
      class="my-2 relative"
      :class="[
        selectModeActiveClass,
        viewMode === 'column' ? 'overflow-hidden' : 'overflow-scroll',
      ]"
      :style="
        viewMode === 'column'
          ? 'height: calc(100vh - 200px); min-height: 400px;'
          : ''
      "
    >
      <component
        :is="
          viewMode === 'list'
            ? MountList
            : viewMode === 'column'
            ? MountColumn
            : MountGrid
        "
        :is-root="viewMode === 'list' ? path.isRootLevel : undefined"
        :tree="tree"
        :show-checkbox="selectModeStoreRefs.selectMode.value"
        :selected-keys="Array.from(selectModeStoreRefs.selectionKeys.value)"
        :indeterminate-keys="selectModeStoreRefs.indeterminateKeys.value"
        @node-click="handleNodeClick"
        @node-toggle="viewMode === 'list' ? handleNodeToggle : undefined"
        @toggle-selection="handleToggleSelection"
        @up="handleUp"
        @show-more-click="viewMode === 'list' ? handleShowMoreClick : undefined"
      />
    </div>

    <!-- Select Mode Components -->
    <SelectModeOverlay />
    <SelectModeActionBar />
  </div>
</template>
