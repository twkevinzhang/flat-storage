<script setup lang="ts">
interface TreeNode {
  name: string;
  mimeType?: FileMimeType;
  children?: TreeNode[];
}
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
const hasChildren = computed(() => size(node.children) > 0);
const isFolder = computed(() => node.mimeType === 'folder');
function toggle() {
  open.value = !open.value;
}
function showMore() {
  // TODO
}
const itemClass = ['flex', 'items-center', 'select-none'];
</script>

<template>
  <li>
    <div
      v-if="isFolder || hasChildren"
      :class="[...itemClass]"
      @click="(e) => toggle()"
    >
      <Hover
        v-if="open"
        :class="[...itemClass]"
        icon="pi-angle-down"
        severity="compact"
      />
      <Hover
        v-else
        :class="[...itemClass]"
        icon="pi-angle-right"
        severity="compact"
      />
      <Hover :class="['w-full', 'p-1']" severity="compact" :label="node.name" />
    </div>

    <Hover
      v-else
      :class="['w-full', 'p-1', ...itemClass]"
      severity="compact"
      icon="pi-file"
      :label="node.name"
    />

    <ul
      v-if="hasChildren && open && node.children"
      :class="isRoot ? [] : ['pl-4']"
    >
      <PathTree
        v-for="child in take(node.children, limit)"
        :key="child.name"
        :node="child"
        :limit="limit"
      />
      <li
        v-if="size(node.children) > limit"
        class="pl-2 text-gray-500 italic cursor-pointer"
        @click="(e) => showMore()"
      >
        ... and {{ size(node.children) - limit }} more
      </li>
    </ul>
  </li>
</template>
