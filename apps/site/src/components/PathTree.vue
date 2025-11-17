<script setup lang="ts">
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
      <Hover v-if="open" :class-name="[...itemClass]">
        <PrimeIcon name="angle-down" />
      </Hover>
      <Hover v-else :class-name="[...itemClass]">
        <PrimeIcon name="angle-right" />
      </Hover>
      <Hover :class-name="['w-full', 'p-1']">
        {{ node.name }}
      </Hover>
    </div>

    <Hover v-else :class-name="[...itemClass]">
      <div :class="[...itemClass]">
        <PrimeIcon name="file-question-alt-1" />
      </div>
      <span class="w-full rounded-md pl-1">
        {{ node.name }}
      </span>
    </Hover>

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
