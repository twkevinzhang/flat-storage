<script setup lang="ts">
import { Entity } from '@site/components/ObjectTree';
import { ColumnKeys } from '@site/models';
import { useListViewStore } from '@site/stores/list-view';

const props = defineProps<{
  class?: any;
  isRoot: boolean;
  tree: Entity[];
  pt?: {
    root?: any;
  };
  showCheckbox?: boolean;
  selectedKeys?: string[];
  indeterminateKeys?: string[];
}>();

const emits = defineEmits<{
  (e: 'nodeToggle', node: Entity, newValue: boolean): void;
  (e: 'nodeClick', node: Entity): void;
  (e: 'showMoreClick'): void;
  (e: 'up'): void;
  (e: 'toggleSelection', node: Entity): void;
}>();

const listViewStore = useListViewStore();
const { activeColumns } = storeToRefs(listViewStore);

const columnWidths = ref<Record<string, number>>({
  [ColumnKeys.name]: 200,
  [ColumnKeys.mimeType]: 128,
  [ColumnKeys.sizeBytes]: 96,
  [ColumnKeys.createdAt]: 150,
  [ColumnKeys.latestUpdatedAt]: 176,
});
</script>
<template>
  <!-- Scrollable container for mobile -->
  <div v-bind="pt?.root" class="overflow-x-auto">
    <div class="min-w-max">
      <!-- Column Headers -->
      <SplitterPx
        v-model:widths="columnWidths"
        class="bg-gray-50 border-b border-gray-300 font-semibold text-sm text-gray-700"
      >
        <SplitterPxPanel
          v-for="col in activeColumns"
          :key="col.key"
          :id="col.key"
          :size="columnWidths[col.key]"
          :min-size="col.key === ColumnKeys.name ? 100 : 60"
          class="p-2"
        >
          <template #default>{{ col.label }}</template>
          <template #handle>
            <div
              class="w-1 h-full opacity-0 hover:opacity-100 bg-blue-400"
            ></div>
          </template>
        </SplitterPxPanel>
      </SplitterPx>

      <ul>
        <!-- Parent directory row -->
        <li v-if="!isRoot">
          <div
            class="flex items-center border-b border-gray-100 hover:bg-gray-50 overflow-hidden"
          >
            <template v-for="col in activeColumns" :key="col.key">
              <div
                v-if="col.key === ColumnKeys.name"
                class="flex items-center flex-shrink-0"
                :style="{ width: columnWidths[ColumnKeys.name] + 'px' }"
              >
                <span class="w-2 flex-shrink-0" />
                <Hover
                  icon="pi pi-folder"
                  label=".."
                  severity="link"
                  @click="(e) => emits('up')"
                />
              </div>
              <div
                v-else
                class="px-2 text-sm text-gray-600 flex-shrink-0 truncate"
                :class="{ 'text-right': col.key === ColumnKeys.sizeBytes }"
                :style="{ width: columnWidths[col.key] + 'px' }"
              >
                -
              </div>
            </template>
          </div>
        </li>

        <!-- Object tree with column widths -->
        <ObjectTree
          :tree="tree"
          :limit="10"
          :columns="activeColumns"
          :column-widths="columnWidths"
          :show-checkbox="showCheckbox"
          :selected-keys="selectedKeys"
          :indeterminate-keys="indeterminateKeys"
          @node-click="(e) => emits('nodeClick', e)"
          @node-toggle="(e, b) => emits('nodeToggle', e, b)"
          @toggle-selection="(e) => emits('toggleSelection', e)"
        />
      </ul>
    </div>
  </div>
</template>
