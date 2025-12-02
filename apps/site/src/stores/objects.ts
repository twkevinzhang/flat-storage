import { defineStore, acceptHMRUpdate } from 'pinia';
import { ObjectsFilter, SessionEntity, Driver } from '@site/models';
import { ref, computed } from 'vue';
import { ObjectAdapter } from '@site/services/entity-adapter';
import { useAsyncState } from '@vueuse/core';
import { LocationQuery } from 'vue-router';
import { ObjectService } from '@site/services/object';

export const useObjectsStore = defineStore('objects', () => {
  type ViewMode = 'list' | 'grid' | 'dense';
  const viewMode = ref<ViewMode>('dense');
  const filter = ref<ObjectsFilter>(ObjectsFilter.empty());
  const sort = ref<string>('');

  const {
    state: rawObjects,
    isLoading,
    error,
    execute: fetch,
  } = useAsyncState(
    async (session: SessionEntity) => {
      const api = new ObjectService();
      const res = await api.listObjects({ session });
      return ObjectAdapter.listFromBackend(res);
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
