<script setup lang="ts">
import { ObjectEntity, SessionEntity } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import { ObjectAdapter, ObjectService } from '@site/services/object';
import { useDialogStore } from '@site/stores/dialog';
import { useObjectsStore } from '@site/stores/objects';
import { useAsyncState } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;
const session = inject<SessionEntity>('session')!;
const route = useRoute();
const mountPath = computed(() => route.params.mountPath as string);

const res = useAsyncState(
  async () => {
    const objectsRes = await objectApi.listObjects({
      session,
      path: mountPath.value,
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

const childrenMap = ref<Record<string, ObjectEntity[]>>({});

const viewMode = computed({
  get: () => objectsStoreRefs.viewMode.value,
  set: objectsStore.setViewMode,
});

function handleUpload() {}

async function handleLoadChildren(path: string): Promise<void> {
  const objectsRes = await objectApi.listObjects({
    session,
    path,
  });
  const entities = ObjectAdapter.listFromBackend(objectsRes);
  childrenMap.value[path] = entities;
}

function handleItemClick(path: string): void {}

onMounted(() => {
  res.execute();
});
</script>

<template>
  <div class="m-4 flex flex-col gap-2">
    <Breadcrumb
      :path="'yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy'"
    />
    <div>
      <Hover severity="compact" @click="(e) => dialogStore.open('menu')">
        <span class="text-xl font-bold break-all"> ContentsContentsCono </span>
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
          @click="(e) => dialogStore.open('filter')"
        />
        <Button
          icon="pi pi-sort-alpha-down"
          severity="secondary"
          @click="(e) => dialogStore.open('sort')"
        />
        <Button
          icon="pi pi-sort"
          severity="secondary"
          @click="(e) => dialogStore.open('order')"
        />
      </ButtonGroup>
    </div>
    <div class="my-2 overflow-y-auto">
      <ul v-if="viewMode === 'column'">
        <ObjectTree
          v-for="obj in res.state.value"
          :key="obj.path"
          :isRoot="true"
          :node="obj"
          :children-map="childrenMap"
          @click="handleItemClick"
          @load-children="handleLoadChildren"
        />
      </ul>
    </div>
  </div>
</template>
