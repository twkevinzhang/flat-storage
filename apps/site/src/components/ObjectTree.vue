<script setup lang="ts">
import { ObjectEntity, ObjectMimeType } from '@site/models';

type Entity = Pick<ObjectEntity, 'mimeType' | 'path'>;

const props = withDefaults(
  defineProps<{
    node: Entity;
    childrenMap?: Record<string, Entity[]>;
    isRoot?: boolean;
    loading?: boolean;
    limit?: number;
  }>(),
  {
    limit: 2,
    isRoot: false,
    loading: false,
    childrenMap: () => ({}),
  }
);

const emits = defineEmits<{
  (e: 'loadChildren', p: string): void;
  (e: 'click', p: string): void;
  (e: 'showMore'): void;
}>();

const children = computed(() => {
  if (!props.childrenMap) return [];
  return props.childrenMap[props.node.path] || [];
});

const open = ref(false);
const angleIcon = computed(() => {
  if (props.loading) {
    return 'pi-spin pi-spinner';
  }
  if (open.value) {
    return 'pi-angle-down';
  }
  return 'pi-angle-right';
});
const isCollapsible = computed(
  () => props.node.mimeType === ObjectMimeType.folder
);
const name = computed(() => props.node.path.split('/').pop());
const mimeIcon = computed(() => {
  if (isCollapsible.value) {
    if (open.value) {
      return 'pi-folder-open';
    } else {
      return 'pi-folder';
    }
  } else {
    return 'pi-file';
  }
});

function toggle() {
  if (open.value) {
    open.value = false;
  } else {
    open.value = true;
    emits('loadChildren', props.node.path);
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

    <ul v-if="isCollapsible && open" :class="isRoot ? [] : ['pl-6']">
      <ObjectTree
        v-for="child in take(children, limit)"
        :key="child.path"
        :node="child"
        :limit="limit"
        :children-map="childrenMap"
        @click="(e) => emits('click', child.path)"
        @load-children="(p) => emits('loadChildren', p)"
      />
      <li
        v-if="size(children) > limit"
        class="pl-2 text-gray-500 italic cursor-pointer"
        @click="(e) => emits('showMore')"
      >
        ... and {{ size(children) - limit }} more
      </li>
    </ul>
  </li>
</template>
