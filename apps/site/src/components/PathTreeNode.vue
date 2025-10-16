<script setup lang="ts">
import { TreeNode } from '@site/types';

const {
  node,
  limit = 2,
  isRoot = false,
} = defineProps<{
  isRoot?: boolean;
  node: TreeNode;
  limit?: number;
}>();
const open = ref(false);
const hasChildren = computed(() => node.children && node.children.length > 0);
const isFolder = computed(() => node.mimeType === 'folder');
function toggle() {
  open.value = !open.value;
}
function showMore() {
  // TODO
}
const hoverableClass = [
  'p-1',
  'rounded-md',
  'cursor-pointer',
  'hover:bg-gray-200/50',
];
const itemClass = ['flex', 'items-center'];
</script>

<template>
  <li>
    <div
      v-if="isFolder || hasChildren"
      :class="[...itemClass]"
      @click="toggle()"
    >
      <div v-if="open" :class="[...itemClass, ...hoverableClass]">
        <SvgIcon name="angle-down" :class-name="['size-5']" />
      </div>
      <div v-else :class="[...itemClass, ...hoverableClass]">
        <SvgIcon name="angle-right" :class-name="['size-5']" />
      </div>
      <span :class="['w-full', ...hoverableClass]">
        {{ node.name }}
      </span>
    </div>

    <div v-else :class="[...itemClass, ...hoverableClass]">
      <div :class="[...itemClass]">
        <SvgIcon name="file-question-alt-1" :class-name="['size-5']" />
      </div>
      <span class="w-full rounded-md pl-1">
        {{ node.name }}
      </span>
    </div>

    <ul
      v-if="hasChildren && open && node.children"
      :class="isRoot ? [] : ['pl-4']"
    >
      <PathTreeNode
        v-for="child in node.children.slice(0, limit)"
        :key="child.name"
        :node="child"
        :limit="limit"
      />
      <li
        v-if="node.children.length > limit"
        class="pl-2 text-gray-500 italic cursor-pointer"
        @click="showMore()"
      >
        ... and {{ node.children.length - limit }} more
      </li>
    </ul>
  </li>
</template>
