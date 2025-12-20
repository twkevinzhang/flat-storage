<script setup lang="ts">
import { Entity } from '@site/components/ObjectTree';
import { ObjectEntity, ObjectMimeType, ObjectsFilter } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import { ObjectAdapter, ObjectService } from '@site/services/object';
import { useDialogStore } from '@site/stores/dialog';
import { useListViewStore } from '@site/stores/list-view';
import { useSessionStore } from '@site/stores/session';
import { useUiStore } from '@site/stores/ui';
import { useAsyncState } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

/**
 * =====
 * Data fetching and listeners
 * =====
 */

const sessionStore = useSessionStore();
const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;

const route = useRoute();
const listViewStore = useListViewStore();
const listViewStoreRefs = storeToRefs(listViewStore);

const sessionId = computed(() => (route.params as any).sessionId as string);
const mount = computed(() => {
  const m = (route.params as any).mount as string;
  if (!m || isEmpty(m)) return '/';
  if (!m.startsWith('/')) return '/' + m;
  return m;
});

const { state: session, execute: fetchSession } = useAsyncState(
  async () => {
    if (!sessionId.value) return null;
    return sessionStore.get(sessionId.value);
  },
  null,
  { immediate: false }
);

const { state: objects, execute: fetchObjects } = useAsyncState(
  async () => {
    if (!session.value) return null;
    if (!mount.value) return null;
    return await objectApi.listObjects({
      session: session.value,
      path: mount.value,
    });
  },
  null,
  { immediate: false }
);

watch(
  () => [sessionId.value, mount.value],
  ([newSessionId, newMount]) => {
    if (newSessionId && newMount) {
      fetchSession().then(() => fetchObjects());
    }
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
  objects,
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

const name = computed(() => {
  const r = mount.value?.split('/').pop();
  if (!r) return '/';
  return r;
});

/**
 * =====
 * Handlers
 * =====
 */

const router = useRouter();

function handleUpload() {}

function handleNavigate(newPath: string): void {
  router.push({
    path: joinPath('/sessions', sessionId.value!, 'mount', newPath),
  });
}

function handleNodeExpand(node: Entity) {
  if (!node.children) {
    node.loading = true;

    objectApi
      .listObjects({
        session: session.value!,
        path: node.path,
      })
      .then((res) => {
        const children = ObjectAdapter.listFromBackend(res);
        node.children = children.map(toLeafNode);
      })
      .finally(() => {
        node.loading = false;
      });
  }
}

function handleNodeClick(node: Entity): void {
  if (node.leaf) {
    handleNavigate(node.path);
  }
}

function handleUp() {
  const p = mount.value;
  if (p === '/') return;
  const parent = p.substring(0, p.lastIndexOf('/')) || '/';
  handleNavigate(parent);
}

function handleShowMoreClick() {}

/**
 * =====
 * Utilities
 * =====
 */

function toLeafNode(v: ObjectEntity): Entity {
  return {
    ...v,
    key: v.path,
    label: v.name,
    leaf: v.mimeType === ObjectMimeType.folder,
    loading: false,
    path: v.path,
    mimeType: v.mimeType,
    sizeBytes: v.sizeBytes,
    latestUpdatedAtISO: v.latestUpdatedAtISO,
  } as any;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>
      <Breadcrumb
        v-if="mount && mount !== '/'"
        :path="mount"
        @navigate="handleNavigate"
      />
      <Hover severity="list-item" @click="(e) => dialogStore.open('menu')">
        <span class="text-xl font-bold break-all"> {{ name }} </span>
        <PrimeIcon name="angle-down" />
      </Hover>
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
        :mount="mount"
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
