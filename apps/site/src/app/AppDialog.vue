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

      {
        label: 'Info',
        items: [
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
        ],
      },
    ]"
    :danger-items="[
      {
        label: 'Delete',
        icon: 'pi pi-trash',
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
