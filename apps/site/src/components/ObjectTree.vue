<script setup lang="ts">
import { ColumnKeys } from '@site/models';
import { Entity } from '@site/components/ObjectTree';

const props = withDefaults(
  defineProps<{
    tree?: Entity[];
    limit?: number;
    indent?: boolean;
    columns?: { label: string; key: ColumnKeys }[];
    columnWidths?: Record<string, number>;
    selectedKey?: string;
    expandedKeys?: string[];
  }>(),
  {
    tree: () => [],
    limit: 10,
    indent: false,
    columns: () => [],
    columnWidths: () => ({}),
  }
);

const emits = defineEmits<{
  (e: 'nodeExpand', node: Entity): void;
  (e: 'nodeClick', node: Entity): void;
  (e: 'showMoreClick'): void;
  (e: 'update:expandedKeys', keys: string[]): void;
}>();

const internalExpandedKeys = ref<Array<string>>([]);

const actualExpandedKeys = computed({
  get: () => props.expandedKeys ?? internalExpandedKeys.value,
  set: (val) => {
    internalExpandedKeys.value = val;
    emits('update:expandedKeys', val);
  },
});

function isExpanded(node: Entity) {
  return actualExpandedKeys.value.includes(node.key);
}

function isSelected(node: Entity) {
  return props.selectedKey === node.key;
}

function angleIcon(node: Entity) {
  if (node.loading) {
    return 'pi-spin pi-spinner';
  }
  if (isExpanded(node)) {
    return 'pi-angle-down';
  }
  return 'pi-angle-right';
}
function mimeIcon(node: Entity) {
  if (node.leaf) {
    if (isExpanded(node)) {
      return 'pi-folder-open';
    } else {
      return 'pi-folder';
    }
  } else {
    return 'pi-file';
  }
}

function nodeToggle(node: Entity) {
  if (isExpanded(node)) {
    actualExpandedKeys.value = actualExpandedKeys.value.filter(
      (key) => key !== node.key
    );
  } else {
    actualExpandedKeys.value = [...actualExpandedKeys.value, node.key];
    emits('nodeExpand', node);
  }
}

function getCellValue(node: Entity, key: ColumnKeys) {
  switch (key) {
    case ColumnKeys.name:
      return node.label;
    case ColumnKeys.mimeType:
      return node.mimeType || '-';
    case ColumnKeys.sizeBytes:
      return node.sizeFormatted || '-';
    case ColumnKeys.createdAt:
      return node.createdAt?.toLocaleString() || '-';
    case ColumnKeys.latestUpdatedAt:
      return node.modifiedAtFormatted || '-';
    default:
      return (node as any)[key] || '-';
  }
}
</script>

<template>
  <ul>
    <li v-for="node in take(props.tree, props.limit)" :key="node.key">
      <!-- Row with dynamic columns -->
      <div
        class="flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors"
        :class="{
          '!bg-primary-50': isSelected(node),
          'bg-white': !isSelected(node),
        }"
      >
        <template v-for="col in props.columns" :key="col.key">
          <!-- Special handling for Name column with toggle/icons -->
          <div
            v-if="col.key === ColumnKeys.name"
            class="flex items-center flex-shrink-0 min-w-0"
            :style="{ width: props.columnWidths[col.key] + 'px' }"
          >
            <template v-if="node.leaf">
              <Hover
                class="w-6 flex-shrink-0"
                :icon="angleIcon(node)"
                :fluid="false"
                rounded="none"
                @click="(e) => nodeToggle(node)"
              />
            </template>
            <template v-else>
              <span class="w-2 flex-shrink-0" />
            </template>
            <div
              :class="[
                'w-full p-2 overflow-hidden',
                props.indent ? 'pl-8' : '',
              ]"
            >
              <Hover
                class="min-w-0"
                :icon="mimeIcon(node)"
                :label="node.label"
                severity="link"
                :fluid="false"
                paddingSize="none"
                @click="(e) => emits('nodeClick', node)"
              />
            </div>
          </div>

          <!-- Generic columns -->
          <div
            v-else
            class="px-2 text-sm text-gray-600 flex-shrink-0 truncate"
            :class="{ 'text-right': col.key === ColumnKeys.sizeBytes }"
            :style="{ width: props.columnWidths[col.key] + 'px' }"
          >
            {{ getCellValue(node, col.key) }}
          </div>
        </template>
      </div>

      <!-- Nested children -->
      <template v-if="node.leaf && isExpanded(node) && node.children">
        <ObjectTree
          :indent="true"
          :tree="node.children"
          :limit="props.limit"
          :columns="props.columns"
          :column-widths="props.columnWidths"
          :selected-key="props.selectedKey"
          v-model:expanded-keys="actualExpandedKeys"
          @node-click="(node) => emits('nodeClick', node)"
          @node-expand="(node) => emits('nodeExpand', node)"
        />
      </template>
    </li>
    <li
      v-if="props.tree.length > props.limit"
      class="pl-2 text-gray-500 italic border-b border-gray-100"
    >
      <Hover
        :label="`... and ${props.tree.length - props.limit} more`"
        severity="link"
        :fluid="false"
        @click="(e) => emits('showMoreClick')"
      />
    </li>
  </ul>
</template>
