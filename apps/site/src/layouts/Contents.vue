<script setup lang="ts">
import { mockFiles } from '@site/models';

const openMenu = ref(false);
const openAction = ref<'filter' | 'sort' | 'order' | null>(null);
const openSetting = ref(false);
const openAdd = ref(false);
const openInfo = ref(false);
const viewMode = ref<'list' | 'grid' | 'dense'>('dense');
</script>

<style scoped>
:deep(.p-datatable-column-resizer) {
  border-right-width: 1px;
  border-right-style: solid;
  border-right-color: var(--p-datatable-body-cell-border-color);
}
</style>

<template>
  <div class="mx-4 mt-4">
    <Breadcrumb
      :path="'yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy'"
    />
    <div class="mt-2">
      <Hover
        class="gap-1 p-1 flex items-center"
        @click="(e) => (openMenu = true)"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      >
        <span class="text-xl font-bold break-all">
          ContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContents
          Layout
        </span>
        <PrimeIcon name="angle-down" />
      </Hover>
    </div>
    <div class="flex justify-between">
      <div class="gap-1 flex justify-start">
        <Button
          @click="(e) => (openSetting = true)"
          aria-label="Settings"
          severity="secondary"
          variant="text"
          icon="pi pi-sliders-h"
        />
        <Hover
          class="gap-1 p-1 flex items-center"
          @click="(e) => (openAdd = true)"
          aria-haspopup="true"
          aria-controls="overlay_menu"
          label="Add"
          suffixIcon="pi-angle-down"
          severity="compact"
        />
      </div>
      <div class="gap-1 flex justify-end">
        <Button
          @click="(e) => (openInfo = true)"
          aria-label="Info"
          severity="secondary"
          variant="text"
          icon="pi pi-info-circle"
        />
      </div>
    </div>
  </div>

  <div class="flex-1 px-4">
    <DataTable
      :value="mockFiles()"
      resizableColumns
      columnResizeMode="expand"
      tableClass="min-w-md"
    >
      <Column field="path" header="path" class="max-w-xs">
        <template #body="{ data: file }">
          <Hover
            severity="link"
            :icon="file.isFolder ? 'pi-folder' : 'pi-file'"
            :label="file.name"
          />
        </template>
      </Column>
      <Column field="mimeType" header="mimeType" class="max-w-xs" />
      <Column
        field="sizeFormatted"
        header="sizeBytes"
        class="max-w-xs flex justify-end"
      />
      <Column field="createdAtISO" header="createdAtISO" class="max-w-xs" />
      <Column
        field="latestUpdatedAtISO"
        header="latestUpdatedAtISO"
        class="max-w-xs"
      />
    </DataTable>
  </div>

  <MenuDialog
    :visible="openMenu"
    @update:visible="() => (openMenu = false)"
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
    :visible="openSetting"
    @update:visible="() => (openSetting = false)"
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
      @click="(e) => (openAction = item.action)"
    >
      <PrimeIcon :fullname="item.icon" />
      <span class="flex-grow">
        {{ item.label }}
      </span>
    </Hover>
  </Dialog>

  <MenuDialog
    :visible="openAdd"
    @update:visible="() => (openAdd = false)"
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
    :visible="openInfo"
    @update:visible="() => (openInfo = false)"
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
    :visible="openAction === 'filter'"
    @update:visible="() => (openAction = null)"
  />

  <ContentsSortDialog
    :visible="openAction === 'sort'"
    @update:visible="() => (openAction = null)"
  />

  <ContentsOrderDialog
    :visible="openAction === 'order'"
    @update:visible="() => (openAction = null)"
  />
</template>
