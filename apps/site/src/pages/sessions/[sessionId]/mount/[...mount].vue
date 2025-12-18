<script setup lang="ts">
import { ObjectEntity, ObjectMimeType } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import { ObjectAdapter, ObjectService } from '@site/services/object';
import { SessionService } from '@site/services/session';
import { useDialogStore } from '@site/stores/dialog';
import { useListViewStore } from '@site/stores/list-view';
import { useAsyncState } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

/**
 * =====
 * Data fetching and listeners
 * =====
 */

const sessionApi = inject<SessionService>(INJECT_KEYS.SessionService)!;
const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;

const route = useRoute();
const listViewStore = useListViewStore();

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
    return await sessionApi.get(sessionId.value);
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
 * UI State
 * =====
 */

const dialogStore = useDialogStore();
const viewMode = ref<'grid' | 'list' | 'column'>('list');
const name = computed(() => '/' + mount.value?.split('/').pop());

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

function handleNodeExpand(node: any) {
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

function handleNodeClick(node: any): void {
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
 * Tree
 * =====
 */

const tree = ref<any[]>([]);

watchEffect(() => {
  if (objects.value) {
    tree.value = objects.value.map(toLeafNode);
  }
});

/**
 * =====
 * Utilities
 * =====
 */

function toLeafNode(v: ObjectEntity): any {
  return {
    key: v.path,
    label: v.name,
    leaf: v.mimeType === ObjectMimeType.folder,
    loading: false,
    path: v.path,
    mimeType: v.mimeType,
    sizeBytes: v.sizeBytes,
    latestUpdatedAtISO: v.latestUpdatedAtISO,
  };
}
</script>

<template>
  <div class="m-4 flex flex-col gap-2">
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
    <div class="flex flex-row justify-between">
      <div class="flex flex-row gap-2">
        <ButtonGroup>
          <Button
            icon="pi pi-filter"
            severity="secondary"
            variant="outlined"
            badge="2"
            badgeSeverity="contrast"
            @click="(e) => dialogStore.open('filter')"
          />
          <Button
            icon="pi pi-sort-alpha-down"
            severity="secondary"
            variant="outlined"
            badge="2"
            badgeSeverity="contrast"
            @click="(e) => dialogStore.open('sort')"
          />
          <Button
            icon="pi pi-sort"
            severity="secondary"
            variant="outlined"
            badge="2"
            badgeSeverity="contrast"
            @click="(e) => dialogStore.open('order')"
          />
        </ButtonGroup>
      </div>
      <div class="flex flex-row gap-2">
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
