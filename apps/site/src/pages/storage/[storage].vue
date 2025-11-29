<script setup lang="ts">
import { useDialogStore } from '@site/stores/dialog';
import { useFilesStore } from '@site/stores/files';
import { storeToRefs } from 'pinia';

const store = useFilesStore();
const { filteredFiles } = storeToRefs(store);
const { open } = useDialogStore();
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
      <Hover @click="(e) => open('menu')">
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
          @click="(e) => open('setting')"
          aria-label="Settings"
          severity="secondary"
          variant="text"
          icon="pi pi-sliders-h"
        />
        <Hover
          @click="(e) => open('add')"
          label="Add"
          suffixIcon="pi-angle-down"
          severity="button"
        />
      </div>
      <div class="gap-1 flex justify-end">
        <Button
          @click="(e) => open('info')"
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
      :value="filteredFiles"
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
        header="size"
        class="max-w-xs flex justify-end"
      />
      <Column header="createdAt" class="max-w-xs">
        <template #body="{ data: file }">
          {{ file.createdAt ? file.createdAt.toLocaleString() : '-' }}
        </template>
      </Column>
      <Column header="updatedAt" class="max-w-xs">
        <template #body="{ data: file }">
          {{
            file.latestUpdatedAt ? file.latestUpdatedAt.toLocaleString() : '-'
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
