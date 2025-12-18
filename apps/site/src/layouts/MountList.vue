<script setup lang="ts">
import { Entity } from '@site/components/ObjectTree';
import { ColumnKeys } from '@site/models';

const props = defineProps({
  mount: {
    type: String,
    required: true,
  },
  tree: {
    type: Array<Entity>,
    required: true,
  },
});
const emits = defineEmits(['nodeClick', 'nodeExpand', 'up', 'showMoreClick']);

const columnWidths = ref<Record<ColumnKeys, number>>({
  [ColumnKeys.name]: 200, // w-48 = 12rem = 200px
  [ColumnKeys.mimeType]: 128, // w-32 = 8rem = 128px
  [ColumnKeys.createdAt]: 96, // w-24 = 6rem = 96px
  [ColumnKeys.latestUpdatedAt]: 176, // w-44 = 11rem = 176px
});
</script>
<template>
  <!-- Scrollable container for mobile -->
  <div class="overflow-x-auto">
    <div class="min-w-max">
      <!-- Column Headers -->
      <SplitterPx v-model:widths="columnWidths" class="bg-gray-50 border-b border-gray-300 font-semibold text-sm text-gray-700">
        <SplitterPxPanel :id="ColumnKeys.name" :size="columnWidths[ColumnKeys.name]" :min-size="100" class="p-2">
          <template #default>Name</template>
          <template #handle>
            <div class="w-1 h-full opacity-0 hover:opacity-100 bg-blue-400"></div>
          </template>
        </SplitterPxPanel>
        <SplitterPxPanel :id="ColumnKeys.mimeType" :size="columnWidths[ColumnKeys.mimeType]" :min-size="60" class="p-2">
          <template #default>Type</template>
          <template #handle>
            <div class="w-1 h-full opacity-0 hover:opacity-100 bg-blue-400"></div>
          </template>
        </SplitterPxPanel>
        <SplitterPxPanel :id="ColumnKeys.createdAt" :size="columnWidths[ColumnKeys.createdAt]" :min-size="60" class="p-2">
          <template #default>Size</template>
          <template #handle>
            <div class="w-1 h-full opacity-0 hover:opacity-100 bg-blue-400"></div>
          </template>
        </SplitterPxPanel>
        <SplitterPxPanel :id="ColumnKeys.latestUpdatedAt" :size="columnWidths[ColumnKeys.latestUpdatedAt]" :min-size="100" class="p-2">
          <template #default>Modified</template>
          <template #handle>
            <div class="w-1 h-full opacity-0 hover:opacity-100 bg-blue-400"></div>
          </template>
        </SplitterPxPanel>
      </SplitterPx>

      <ul>
        <!-- Parent directory row -->
        <li v-if="props.mount !== '/'">
          <div
            class="flex items-center border-b border-gray-100 hover:bg-gray-50 overflow-hidden"
          >
            <div class="flex items-center flex-shrink-0" :style="{ width: columnWidths[ColumnKeys.name] + 'px' }">
              <span class="w-2 flex-shrink-0" />
              <Hover
                icon="pi pi-folder"
                label=".."
                severity="link"
                paddingSize="lg"
                @click="(e) => emits('up')"
              />
            </div>
            <div
              class="px-2 text-sm text-gray-600 flex-shrink-0 truncate"
              :style="{ width: columnWidths[ColumnKeys.mimeType] + 'px' }"
            >
              -
            </div>
            <div
              class="px-2 text-sm text-gray-600 text-right flex-shrink-0 truncate"
              :style="{ width: columnWidths[ColumnKeys.createdAt] + 'px' }"
            >
              -
            </div>
            <div
              class="px-2 text-sm text-gray-600 flex-shrink-0 truncate"
              :style="{ width: columnWidths[ColumnKeys.latestUpdatedAt] + 'px' }"
            >
              -
            </div>
          </div>
        </li>

        <!-- Object tree with column widths -->
        <ObjectTree
          :tree="tree"
          :limit="10"
          :column-widths="{
            name: columnWidths[ColumnKeys.name],
            type: columnWidths[ColumnKeys.mimeType],
            size: columnWidths[ColumnKeys.createdAt],
            modified: columnWidths[ColumnKeys.latestUpdatedAt]
          }"
          @node-click="(e) => emits('nodeClick', e)"
          @node-expand="(e) => emits('nodeExpand', e)"
        />
      </ul>
    </div>
  </div>
</template>
