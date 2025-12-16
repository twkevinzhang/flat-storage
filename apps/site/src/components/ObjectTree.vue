<script setup lang="ts">
import { ObjectMimeType } from '@site/models';

interface Entity {
  key: string;
  label: string;
  leaf: boolean;
  loading: boolean;
  mimeType: ObjectMimeType;
  children?: Entity[];
}

const props = withDefaults(
  defineProps<{
    values?: Entity[];
    limit?: number;
  }>(),
  {
    values: () => [],
    limit: 2,
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
  <ul class="pl-6">
    <li v-for="node in take(values, limit)" :key="node.key">
      <div v-if="node.leaf" class="flex">
        <Hover
          class="w-6"
          :icon="angleIcon(node)"
          rounded="l"
          @click="(e) => nodeToggle(node)"
        />
        <Hover
          rounded="r"
          :icon="mimeIcon(node)"
          :label="node.label"
          fluid
          @click="(e) => emits('nodeClick', node)"
        />
      </div>

      <div v-else class="flex">
        <span class="pl-2" />
        <Hover
          class="w-full"
          :icon="mimeIcon(node)"
          :label="node.label"
          @click="(e) => emits('nodeClick', node)"
        />
      </div>

      <template v-if="node.leaf && expanded(node) && node.children">
        <ObjectTree
          :values="node.children"
          :limit="limit"
          @node-click="(node) => emits('nodeClick', node)"
          @node-expand="(node) => emits('nodeExpand', node)"
        />
      </template>
    </li>
    <li
      v-if="size(values) > limit"
      class="pl-2 text-gray-500 italic cursor-pointer"
      @click="(e) => emits('showMoreClick')"
    >
      ... and {{ size(values) - limit }} more
    </li>
  </ul>
</template>
