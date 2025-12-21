<script setup lang="ts">
import { Entity } from '@site/components/ObjectTree';
import { ObjectEntity, ObjectMimeType, ObjectsFilter } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import { ObjectService } from '@site/services/object';
import { useDialogStore } from '@site/stores/dialog';
import { useListViewStore } from '@site/stores/list-view';
import { useSessionStore } from '@site/stores/session';
import { useUiStore } from '@site/stores/ui';
import { useMetadataStore } from '@site/stores/metadata';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

/**
 * =====
 * Data fetching and listeners
 * =====
 */

const sessionStore = useSessionStore();
const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;

const router = useRouter();
const route = useRoute();
const listViewStore = useListViewStore();
const listViewStoreRefs = storeToRefs(listViewStore);
const metadataStore = useMetadataStore();

const sessionId = computed(() => (route.params as any).sessionId as string);
const mount = computed(() => (route.params as any).mount as string);

const { state: session, execute: fetchSession } = useAsyncState(
  async () => {
    if (!sessionId.value) return null;
    const s = sessionStore.get(sessionId.value);
    if (s) {
      await metadataStore.load(s);
    }
    return s;
  },
  null,
  { immediate: false }
);

const { entities } = storeToRefs(metadataStore);

const { state: objects, execute: fetchObjects } = useAsyncState(
  async () => {
    if (!session.value) return null;
    if (!mount.value) return null;
    return await objectApi.listObjects({
      session: session.value,
      path: mount.value,
      entities: entities.value,
    });
  },
  null,
  { immediate: false }
);

watch(
  () => [sessionId.value, mount.value, entities.value] as const,
  async ([newSessionId, newMount]) => {
    if (newSessionId && isEmpty(newMount)) {
      router.replace({ path: joinPath('/sessions', newSessionId) });
    }
    if (newSessionId && newMount) {
      if (!session.value || session.value.id !== newSessionId) {
        await fetchSession();
      }
      await fetchObjects();
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

const mountLevel = computed(
  () => (route.params as any).mount?.split('/').length || 1
);

/**
 * =====
 * Handlers
 * =====
 */

function handleUpload() {}

function handleNavigate(...newPath: string[]): void {
  router.push({
    path: joinPath('/sessions', sessionId.value!, 'mount', ...newPath),
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
      .then((children) => {
        node.children = children.map(toLeafNode);
      })
      .finally(() => {
        node.loading = false;
      });
  }
}

function handleNodeClick(node: Entity): void {
  if (node.leaf) {
    handleNavigate(mount.value!, node.path);
  }
}

function handleUp() {
  const p = mount.value;
  if (p === '/') return;
  const parent = p.substring(0, p.lastIndexOf('/')) || '/';
  handleNavigate(parent);
}

function handleShowMoreClick() {}

async function handleRefresh() {
  if (!session.value) return;
  try {
    await metadataStore.refresh(session.value);
    toast.add({
      severity: 'success',
      summary: 'Refresh Success',
      detail: 'Metadata has been reloaded from GCS',
      life: 3000,
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to reload metadata',
      life: 3000,
    });
  }
}

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
        v-if="mountLevel > 1"
        :path="mount"
        @navigate="handleNavigate"
      />
      <div class="flex items-center gap-2">
        <Hover
          class="flex-1"
          severity="list-item"
          :fluid="false"
          @click="(e) => dialogStore.open('menu')"
        >
          <span class="text-xl font-bold break-all">
            {{ name }}
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
