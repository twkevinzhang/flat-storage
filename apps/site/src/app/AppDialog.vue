<script setup lang="ts">
import { useDialogStore } from '@site/stores/dialog';
import { useObjectsStore } from '@site/stores/objects';
import { storeToRefs } from 'pinia';

const { visible, open, close } = useDialogStore();
const store = useObjectsStore();
const { viewMode: viewModeRef } = storeToRefs(store);
const { setViewMode } = store;

const viewMode = computed({
  get: () => viewModeRef.value,
  set: setViewMode,
});
</script>

<template>
  <MenuDialog
    :visible="visible('menu')"
    @update:visible="() => close('menu')"
    header="Action"
    :items="[
      {
        label: '重新命名',
        icon: 'pi pi-pencil',
      },
      {
        label: '移動到...',
        icon: 'pi pi-directions',
      },
      {
        label: '上鎖',
        icon: 'pi pi-lock',
      },
      {
        label: '新增到最愛',
        icon: 'pi pi-star',
      },
      {
        label: '刪除',
        icon: 'pi pi-trash',
      },
    ]"
  />
  <Dialog
    :visible="visible('setting')"
    @update:visible="() => close('setting')"
    header="Setting"
    modal
    pt:root:class="w-md h-3/4"
  >
    <Fieldset legend="View Mode" class="mb-4">
      <SelectButton
        v-model="viewMode"
        :options="[
          { icon: 'list', name: '清單', value: 'list' },
          { icon: 'th-large', name: '網格', value: 'grid' },
        ]"
        optionLabel="name"
        dataKey="value"
        fluid
      >
        <template #option="{ option }">
          <PrimeIcon :name="option.icon" size="large" />
        </template>
      </SelectButton>
    </Fieldset>
    <div class="p-4" />
    <Hover
      v-for="item in [
        {
          label: 'Filter',
          action: 'filter',
          icon: 'pi-filter',
        },
        {
          label: 'Sort',
          action: 'sort',
          icon: 'pi-sort-alpha-down',
        },
        {
          label: 'Order',
          action: 'order',
          icon: 'pi-sort',
        },
      ]"
      class="flex items-center gap-3 p-2"
      @click="() => open(item.action)"
    >
      <PrimeIcon :fullname="item.icon" />
      <span>
        {{ item.label }}
      </span>
    </Hover>
  </Dialog>

  <MenuDialog
    :visible="visible('add')"
    @update:visible="() => close('add')"
    header="Add"
    :items="[
      {
        label: '新增資料夾',
        icon: 'pi pi-folder-plus',
      },
      {
        label: '上傳檔案',
        icon: 'pi pi-upload',
      },
      {
        label: '上傳資料夾',
        icon: 'pi pi-upload',
      },
    ]"
  />

  <MenuDialog
    :visible="visible('info')"
    @update:visible="() => close('info')"
    header="Info"
    :items="[
      {
        label: '下載',
        icon: 'pi pi-download',
      },
      {
        label: '複製路徑',
        icon: 'pi pi-clone',
      },
      {
        label: '統計',
        icon: 'pi pi-chart-bar',
      },
      {
        label: '操作紀錄',
        icon: 'pi pi-history',
      },
    ]"
  />

  <ObjectsFilterDialog
    :visible="visible('filter')"
    @update:visible="() => close('filter')"
  />

  <ObjectsSortDialog
    :visible="visible('sort')"
    @update:visible="() => close('sort')"
  />

  <ObjectsOrderDialog
    :visible="visible('order')"
    @update:visible="() => close('order')"
  />

  <NewSessionDialog
    :visible="visible('new-session')"
    @update:visible="() => close('new-session')"
  />
</template>
