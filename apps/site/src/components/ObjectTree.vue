<script setup lang="ts">
import { Entity } from './ObjectTree';

const props = withDefaults(
  defineProps<{
    tree?: Entity[];
    limit?: number;
    indent?: boolean;
    columnWidths?: {
      name: number;
      type: number;
      size: number;
      modified: number;
    };
  }>(),
  {
    tree: () => [],
    limit: 10,
    indent: false,
    columnWidths: () => ({
      name: 200,
      type: 128,
      size: 96,
      modified: 176,
    }),
  }
);

const emits = defineEmits<{
  (e: 'nodeExpand', node: Entity): void;
  (e: 'nodeClick', node: Entity): void;
  (e: 'showMoreClick'): void;
}>();

const expandedKeys = ref<Array<string>>([]);

function expanded(node: Entity) {
  return expandedKeys.value.includes(node.key);
}
function angleIcon(node: Entity) {
  if (node.loading) {
    return 'pi-spin pi-spinner';
  }
  if (expanded(node)) {
    return 'pi-angle-down';
  }
  return 'pi-angle-right';
}
function mimeIcon(node: Entity) {
  if (node.leaf) {
    if (expanded(node)) {
      return 'pi-folder-open';
    } else {
      return 'pi-folder';
    }
  } else {
    return 'pi-file';
  }
}

function nodeToggle(node: Entity) {
  if (expanded(node)) {
    expandedKeys.value = expandedKeys.value.filter((key) => key !== node.key);
  } else {
    expandedKeys.value.push(node.key);
    emits('nodeExpand', node);
  }
}
</script>

<template>
  <ul :class="indent ? 'pl-6' : ''">
    <li v-for="node in take(props.tree, props.limit)" :key="node.key">
      <!-- Folder row with expand button -->
      <div class="flex items-center border-b border-gray-100 hover:bg-gray-50">
        <div
          class="flex items-center"
          :style="{ width: props.columnWidths.name + 'px' }"
        >
          <template v-if="node.leaf">
            <Hover
              class="w-6 flex-shrink-0"
              :icon="angleIcon(node)"
              :fluid="false"
              rounded="none"
              @click="(e) => nodeToggle(node)"
            />
            <div class="w-full p-2">
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
          </template>
          <template v-else>
            <span class="w-2 flex-shrink-0" />
            <div class="w-full p-2">
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
          </template>
        </div>
        <div
          class="px-2 text-sm text-gray-600 flex-shrink-0 break-all"
          :style="{ width: props.columnWidths.type + 'px' }"
        >
          {{ node.mimeType || '-' }}
        </div>
        <div
          class="px-2 text-sm text-gray-600 flex-shrink-0 break-all text-right"
          :style="{ width: props.columnWidths.size + 'px' }"
        >
          {{ node.sizeFormatted }}
        </div>
        <div
          class="px-2 text-sm text-gray-600 flex-shrink-0 break-all"
          :style="{ width: props.columnWidths.modified + 'px' }"
        >
          {{ node.latestUpdatedAt }}
        </div>
      </div>

      <!-- Nested children -->
      <template v-if="node.leaf && expanded(node) && node.children">
        <ObjectTree
          :indent="true"
          :tree="node.children"
          :limit="props.limit"
          :column-widths="props.columnWidths"
          @node-click="(node) => emits('nodeClick', node)"
          @node-expand="(node) => emits('nodeExpand', node)"
        />
      </template>
    </li>
    <li
      v-if="size(props.tree) > props.limit"
      class="pl-2 text-gray-500 italic border-b border-gray-100"
    >
      <Hover
        :label="`... and ${size(props.tree) - props.limit} more`"
        severity="link"
        :fluid="false"
        @click="(e) => emits('showMoreClick')"
      />
    </li>
  </ul>
</template>
