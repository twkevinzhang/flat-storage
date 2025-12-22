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

/**
 * =====
 * Handlers
 * =====
 */

function handleUpload() {}

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
    <div>
      <Breadcrumb
        v-if="!path.isRootLevel"
        :path="path"
        @navigate="(e: EntityPath) => handleNavigate(e)"
      />
      <div class="flex items-center gap-2">
        <Hover
          class="flex-1"
          severity="list-item"
          :fluid="false"
          @click="(e) => dialogStore.open('menu')"
        >
          <span class="text-xl font-bold break-all">
            {{ listViewStoreRefs.name.value }}
          </span>
          <PrimeIcon name="angle-down" />
        </Hover>
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          variant="outlined"
          @click="(e) => handleRefresh()"
        />
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <SelectButton
          v-model="viewMode"
          size="large"
          :options="[
            { icon: 'th-large', name: 'Grid', value: 'grid' },
            { icon: 'list', name: 'List', value: 'list' },
            { icon: 'map', name: 'Column', value: 'column' },
          ]"
          optionLabel="name"
          optionValue="value"
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
            :badge="listViewStoreRefs.filterCount.value"
            badgeSeverity="contrast"
            @click="(e) => dialogStore.open('filter')"
          />
          <Button
            icon="pi pi-sort-alpha-down"
            severity="secondary"
            variant="outlined"
            :badge="listViewStoreRefs.sortRulesCount.value"
            badgeSeverity="contrast"
            @click="(e) => dialogStore.open('sort')"
          />
        </ButtonGroup>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <SplitButton
          label="Upload"
          @click="(e) => handleUpload()"
          :model="[
            {
              label: 'Create Folder',
              icon: 'pi pi-folder-plus',
              command: () => {},
            },
          ]"
        />
        <Button
          icon="pi pi-sort"
          severity="secondary"
          variant="outlined"
          badgeSeverity="contrast"
          @click="(e) => dialogStore.open('order')"
        />
      </div>
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
