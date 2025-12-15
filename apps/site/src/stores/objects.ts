import { defineStore, acceptHMRUpdate } from 'pinia';
import { ObjectsFilter, SessionEntity, Driver } from '@site/models';
import { useAsyncState } from '@vueuse/core';
import { LocationQuery } from 'vue-router';
import {
  MockObjectService,
  ObjectAdapter,
  ObjectService,
} from '@site/services/object';
import { MockSessionService, SessionAdapter } from '@site/services/session';
import { INJECT_KEYS } from '@site/services';

export const useObjectsStore = defineStore('objects', () => {
  type ViewMode = 'grid' | 'column';
  const viewMode = ref<ViewMode>('column');
  const filter = ref<ObjectsFilter>(ObjectsFilter.empty());
  const sort = ref<string>('');

  const {
    state: rawObjects,
    isLoading,
    error,
    execute: fetch,
  } = useAsyncState(
    async (path: string) => {
      const objectApi = inject<ObjectService>(INJECT_KEYS.ObjectService)!;
      const session = inject<SessionEntity>('session')!;
      const objectRes = await objectApi.listObjects({ session, path });
      return ObjectAdapter.listFromBackend(objectRes);
    },
    [],
    { immediate: false }
  );

  return {
    viewMode: computed(() => viewMode.value),
    filter: computed(() => filter.value),
    sort: computed(() => sort.value),
    filteredObjects: computed(() => {
      let result = rawObjects.value;
      if (filter.value.isEmpty) return result;

      const { name, createdAt } = filter.value;

      if (name && name.operator && name.condition) {
        const condition = name.condition.toLowerCase();
        if (name.operator === 'contains') {
          result = result.filter((f) =>
            f.name.toLowerCase().includes(condition)
          );
        } else if (name.operator === 'notContains') {
          result = result.filter(
            (f) => !f.name.toLowerCase().includes(condition)
          );
        }
      }

      if (createdAt) {
        if (createdAt.start) {
          result = result.filter(
            (f: any) => f.createdAt && f.createdAt >= createdAt.start!
          );
        }
        if (createdAt.end) {
          result = result.filter(
            (f: any) => f.createdAt && f.createdAt <= createdAt.end!
          );
        }
      }

      return result;
    }),
    loading: computed(() => isLoading.value),
    error: computed(() => error.value),
    setViewMode(mode: ViewMode): void {
      viewMode.value = mode;
    },
    fetch,
    setFilter(newFilter: LocationQuery): void {
      filter.value = ObjectsFilter.fromObj(newFilter);
    },
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useObjectsStore, import.meta.hot));
}
