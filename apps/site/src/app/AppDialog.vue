<script setup lang="ts">
import { useDialogStore } from '@site/stores/dialog';
import { useFilesStore } from '@site/stores/files';
import { storeToRefs } from 'pinia';

const { visible, open, close } = useDialogStore();
const store = useFilesStore();
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
        command: (e) => {},
      },
      {
        label: '移動到...',
        icon: 'pi pi-directions',
        command: (e) => {},
      },
      {
        label: '上鎖',
        icon: 'pi pi-lock',
        command: (e) => {},
      },
      {
        label: '新增到最愛',
        icon: 'pi pi-star',
        command: (e) => {},
      },
      {
        label: '刪除',
        icon: 'pi pi-trash',
        command: (e) => {},
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
      <span class="flex-grow">
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
        command: (e) => {},
      },
      {
        label: '上傳檔案',
        icon: 'pi pi-upload',
        command: (e) => {},
      },
      {
        label: '上傳資料夾',
        icon: 'pi pi-upload',
        command: (e) => {},
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
        command: (e) => {},
      },
      {
        label: '複製路徑',
        icon: 'pi pi-clone',
        command: (e) => {},
      },
      {
        label: '統計',
        icon: 'pi pi-chart-bar',
        command: (e) => {},
      },
      {
        label: '操作紀錄',
        icon: 'pi pi-history',
        command: (e) => {},
      },
    ]"
  />

  <ContentsFilterDialog
    :visible="visible('filter')"
    @update:visible="() => close('filter')"
  />

  <ContentsSortDialog
    :visible="visible('sort')"
    @update:visible="() => close('sort')"
  />

  <ContentsOrderDialog
    :visible="visible('order')"
    @update:visible="() => close('order')"
  />
</template>
