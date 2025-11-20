<script setup lang="ts">
import { mockFiles } from '@site/models';

const openMenu = ref(false);
const openAction = ref<'filter' | 'sort' | 'order' | null>(null);
const openSetting = ref(false);
const openAdd = ref(false);
const openInfo = ref(false);
const viewMode = ref<'list' | 'grid' | 'dense'>('list');
</script>

<template>
  <div class="mx-4 mt-4">
    <Breadcrumb
      :path="'yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy'"
    />
    <div class="mt-2">
      <Hover
        className="gap-1 p-1 flex items-center"
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
    <div class="my-1 flex justify-between">
      <div class="gap-1 flex justify-start">
        <SecondaryButton
          @click="(e) => (openSetting = true)"
          aria-label="Settings"
          variant="text"
          class="pi pi-sliders-h"
        />
        <Hover
          className="gap-1 p-1 flex items-center"
          @click="(e) => (openAdd = true)"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        >
          <span> Add </span>
          <PrimeIcon name="angle-down" />
        </Hover>
      </div>
      <div class="gap-1 flex justify-end">
        <SecondaryButton
          @click="(e) => (openInfo = true)"
          aria-label="Info"
          variant="text"
          class="pi pi-info-circle"
        />
      </div>
    </div>
  </div>

  <div class="flex-1 px-4">
    <FileList :files="mockFiles()" />
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
        size="large"
        class="w-full"
        v-model="viewMode"
        :options="[
          { icon: 'pi pi-list', name: '清單', value: 'list' },
          { icon: 'pi pi-th-large', name: '網格', value: 'grid' },
        ]"
        optionLabel="name"
        dataKey="value"
      >
        <template #option="slotProps">
          <i :class="slotProps.option.icon"></i>
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
          icon: 'pi-filter',
        },
        {
          label: 'Order',
          action: 'order',
          icon: 'pi-filter',
        },
      ]"
      className="flex items-center gap-3 p-2"
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
</template>
