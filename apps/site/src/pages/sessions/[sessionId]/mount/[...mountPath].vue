<script setup lang="ts">
import { ObjectEntity, ObjectMimeType, SessionEntity } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import { ObjectAdapter, ObjectService } from '@site/services/object';
import { useDialogStore } from '@site/stores/dialog';
import { useObjectsStore } from '@site/stores/objects';
import { useAsyncState } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;
const session = inject<Ref<SessionEntity>>('sessionRef')!;
const route = useRoute();
const router = useRouter();

const res = useAsyncState(
  async (path: string) => {
    const objectsRes = await objectApi.listObjects({
      session: session.value,
      path,
    });
    return ObjectAdapter.listFromBackend(objectsRes);
  },
  [],
  {
    immediate: false,
  }
);
const dialogStore = useDialogStore();
const objectsStore = useObjectsStore();
const objectsStoreRefs = storeToRefs(objectsStore);

const mountPath = computed(() => {
  const _mountPath = route.params.mountPath as string;
  if (!_mountPath || isEmpty(_mountPath)) {
    return '/';
  }
  if (!_mountPath.startsWith('/')) {
    return '/' + _mountPath;
  }
  return _mountPath;
});
const name = computed(() => {
  if (mountPath.value === '/') {
    return '/';
  }
  return mountPath.value.split('/').pop()!;
});
const viewMode = computed({
  get: () => objectsStoreRefs.viewMode.value,
  set: objectsStore.setViewMode,
});
const values = ref<any[]>([]);

function handleUpload() {}

function handleNodeExpand(node: any) {
  if (!node.children) {
    node.loading = true;

    objectApi
      .listObjects({
        session: session.value,
        path: node.path,
      })
      .then((res) => {
        const children = ObjectAdapter.listFromBackend(res);
        node.children = children.map((v) => ({
          key: v.path,
          label: v.name,
          leaf: v.mimeType === ObjectMimeType.folder,
          loading: false,
          path: v.path,
          mimeType: v.mimeType,
        }));
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

function handleNavigate(newPath: string): void {
  router.push({
    path: joinPath('/sessions', session.value.id, 'mount', newPath),
  });
}


function handleUp() {
  const p = mountPath.value;
  if (p === '/') return;
  const parent = p.substring(0, p.lastIndexOf('/')) || '/';
  handleNavigate(parent);
}

watchEffect(() => {
  if (res.state.value) {
    values.value = res.state.value.map((v) => ({
      key: v.path,
      label: v.name,
      leaf: v.mimeType === ObjectMimeType.folder,
      loading: false,
      path: v.path,
      mimeType: v.mimeType,
    }));
  }
});

watch(
  mountPath,
  () => {
    res.execute(0, mountPath.value);
  },
  { immediate: true }
);
</script>

<template>
  <div class="m-4 flex flex-col gap-2">
    <div>
      <Breadcrumb
        v-if="mountPath !== '/'"
        :path="mountPath"
        @navigate="handleNavigate"
      />
      <Hover severity="list-item" @click="(e) => dialogStore.open('menu')">
        <span class="text-xl font-bold break-all"> {{ name }} </span>
        <PrimeIcon name="angle-down" />
      </Hover>
    </div>
    <div class="flex flex-row gap-2">
      <SelectButton
        v-model="viewMode"
        size="large"
        :options="[
          { icon: 'th-large', name: 'Grid', value: 'grid' },
          { icon: 'list', name: 'List', value: 'list' },
          { icon: 'map', name: 'Column', value: 'column' },
        ]"
        optionLabel="name"
        dataKey="value"
      >
        <template #option="{ option }">
          <PrimeIcon :name="option.icon" />
        </template>
      </SelectButton>
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
    <div class="my-2 overflow-y-auto">
      <ul v-if="viewMode === 'column'">
        <li v-if="mountPath !== '/'">
          <div class="flex">
            <span class="pl-2" />
            <Hover
              icon="pi pi-folder"
              label=".."
              severity="link"
              :fluid="true"
              paddingSize="lg"
              @click="handleUp"
            />
          </div>
        </li>
        <ObjectTree
          :values="values"
          :limit="100"
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
        />
      </ul>
    </div>
  </div>
</template>
