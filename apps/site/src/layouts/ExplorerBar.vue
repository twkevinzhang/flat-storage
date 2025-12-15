<script setup lang="ts">
import { ObjectEntity, SessionEntity } from '@site/models';
import { INJECT_KEYS } from '@site/services';
import {
  ObjectAdapter,
  ObjectService,
} from '@site/services/object';
import { useAsyncState } from '@vueuse/core';

const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;

const { session } = defineProps<{ session: SessionEntity }>();

const {
  state: parents,
  isLoading,
  error,
  execute: fetch,
} = useAsyncState(async () => {
  const objectsRes = await objectApi.listObjects({
    session,
    path: '/',
  });
  return ObjectAdapter.listFromBackend(objectsRes);
}, [], {
  immediate: false,
});

const childrenMap = ref<Record<string, ObjectEntity[]>>({});

async function handleLoadChildren(path: string): Promise<void> {
  const objectsRes = await objectApi.listObjects({
    session,
    path,
  });
  const entities = ObjectAdapter.listFromBackend(objectsRes);
  childrenMap.value[path] = entities;
}

onMounted(() => {
  fetch();
});
</script>

<template>
  <div class="p-2 h-screen overflow-y-auto">
    <div class="p-2">
      <span class="font-bold">Explorer</span>
    </div>
    <ul>
      <ObjectTree
        v-for="obj in parents"
        :key="obj.path"
        :node="obj"
        :children-map="childrenMap"
        @load-children="handleLoadChildren"
      />
    </ul>
  </div>
</template>
