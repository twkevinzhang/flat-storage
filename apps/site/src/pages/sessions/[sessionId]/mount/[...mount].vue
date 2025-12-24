<script setup lang="ts">
import { Entity } from '@site/components/ObjectTree';
import {
  ObjectEntity,
  ObjectMimeType,
  ObjectsFilter,
  EntityPath,
} from '@site/models';
import { useDialogStore } from '@site/stores/dialog';
import { pathIt, useListViewStore } from '@site/stores/list-view';
import { useSessionStore } from '@site/stores/session';
import { useUiStore } from '@site/stores/ui';
import { useMetadataStore } from '@site/stores/metadata';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';

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

const path = computed(() => {
  const sessionId = (route.params as any).sessionId as string;
  const mount = (route.params as any).mount as string;
  return EntityPath.fromRoute({ sessionId, mount });
});
const session = computed(() => {
  const sessionId = (route.params as any).sessionId as string;
  return sessionStore.get(sessionId);
});

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
 * UI State
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
    icon: 'pi pi-sort',
    command: () => {
      dialogStore.open('order');
    },
  },
]);

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

function handleNodeExpand(node: Entity) {
  if (!node.children) {
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
    <Breadcrumb
      v-if="!path.isRootLevel"
      :path="path"
      @navigate="(e: EntityPath) => handleNavigate(e)"
    />

    <!-- 資料夾名稱列 (獨立一行) -->
    <div class="flex items-center gap-2">
      <!-- 選擇模式按鈕 (僅桌面版) -->
      <Button
        v-if="isDesktop"
        icon="pi pi-check-square"
        :severity="uiStore.selectMode ? 'info' : 'secondary'"
        :variant="uiStore.selectMode ? 'filled' : 'outlined'"
        aria-label="選擇模式"
        @click="uiStore.toggleSelectMode()"
      />

      <!-- 資料夾名稱 + 選單 -->
      <Hover
        class="flex-1"
        severity="list-item"
        :fluid="false"
        @click="dialogStore.open('menu')"
      >
        <span :class="['font-bold break-all', isDesktop ? 'text-xl' : 'text-lg']">
          {{ listViewStoreRefs.name.value }}
        </span>
        <PrimeIcon name="angle-down" />
      </Hover>
    </div>

    <!-- 工具列容器 -->
    <div :class="['flex items-center', isMobile ? 'gap-2' : 'gap-4']">
      <!-- 手機版：更多選單 + 主要操作 -->
      <div
        v-if="isMobile"
        class="flex items-center gap-2 w-full"
      >
        <Menu ref="moreMenu" :model="moreMenuItems" :popup="true" />
        <Button
          icon="pi pi-ellipsis-v"
          severity="secondary"
          variant="outlined"
          aria-label="更多選項"
          @click="(e) => moreMenu?.toggle(e)"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          variant="outlined"
          aria-label="重新整理"
          @click="handleRefresh()"
        />
        <SplitButton
          label="Upload"
          severity="primary"
          :model="[
            {
              label: 'Create Folder',
              icon: 'pi pi-folder-plus',
              command: () => {},
            },
          ]"
          @click="handleUpload()"
        />
      </div>

      <!-- 桌面版：區域 2 + 區域 3 -->
      <template v-else>
        <!-- 區域 2: View & Organization -->
        <div class="flex items-center gap-3">
          <SelectButton
            v-model="viewMode"
            option-label="name"
            option-value="value"
            :options="[
              { icon: 'th-large', name: 'Grid', value: 'grid' },
              { icon: 'list', name: 'List', value: 'list' },
              { icon: 'map', name: 'Column', value: 'column' },
            ]"
          >
            <template #option="{ option }">
              <PrimeIcon :name="option.icon" />
            </template>
          </SelectButton>
          <ButtonGroup>
            <Button
              icon="pi pi-filter"
              severity="secondary"
              variant="outlined"
              badge-severity="contrast"
              aria-label="篩選"
              :badge="listViewStoreRefs.filterCount.value"
              @click="dialogStore.open('filter')"
            />
            <Button
              icon="pi pi-sort-alpha-down"
              severity="secondary"
              variant="outlined"
              badge-severity="contrast"
              aria-label="排序"
              :badge="listViewStoreRefs.sortRulesCount.value"
              @click="dialogStore.open('sort')"
            />
            <Button
              icon="pi pi-sort"
              severity="secondary"
              variant="outlined"
              aria-label="欄位順序"
              @click="dialogStore.open('order')"
            />
          </ButtonGroup>
        </div>

        <!-- 區域 3: Primary Actions -->
        <div class="flex items-center gap-2">
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            variant="outlined"
            aria-label="重新整理"
            @click="handleRefresh()"
          />
          <SplitButton
            label="Upload"
            severity="primary"
            :model="[
              {
                label: 'Create Folder',
                icon: 'pi pi-folder-plus',
                command: () => {},
              },
            ]"
            @click="handleUpload()"
          />
        </div>
      </template>
    </div>

    <!-- 手機版第二列：視圖模式 -->
    <div v-if="isMobile" class="mt-2 flex items-center">
      <SelectButton
        v-model="viewMode"
        size="small"
        option-label="name"
        option-value="value"
        :options="[
          { icon: 'th-large', name: 'Grid', value: 'grid' },
          { icon: 'list', name: 'List', value: 'list' },
          { icon: 'map', name: 'Column', value: 'column' },
        ]"
      >
        <template #option="{ option }">
          <PrimeIcon :name="option.icon" />
        </template>
      </SelectButton>
    </div>
    <div class="my-2 overflow-y-auto">
      <MountList
        v-if="viewMode === 'list'"
        :is-root="path.isRootLevel"
        :tree="tree"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @up="handleUp"
        @show-more-click="handleShowMoreClick"
      />
      <MountGrid v-if="viewMode === 'grid'" />
    </div>
  </div>
</template>
