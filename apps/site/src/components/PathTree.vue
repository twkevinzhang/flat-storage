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
function toggle() {
  open.value = !open.value;
}
function showMore() {
  // TODO
}
</script>

<template>
  <li>
    <div v-if="node.isFolder" class="flex" @click="(e) => toggle()">
      <Hover
        :icon="open ? 'pi-angle-down' : 'pi-angle-right'"
        severity="compact-split-left"
      />
      <Hover
        class="w-full"
        severity="compact-split-right"
        :icon="
          node.isFolder ? (open ? 'pi-folder-open' : 'pi-folder') : 'pi-file'
        "
        :label="node.name"
      />
    </div>

    <div v-else class="flex" @click="(e) => toggle()">
      <span class="pl-2" />
      <Hover
        class="w-full"
        severity="compact"
        icon="pi-file"
        :label="node.name"
      />
    </div>

    <ul
      v-if="node.isFolder && open && node.children"
      :class="isRoot ? [] : ['pl-6']"
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
