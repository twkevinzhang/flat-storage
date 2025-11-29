import { defineStore, acceptHMRUpdate } from 'pinia';
import { FilesFilter, FileEntity } from '@site/models';
import { ref, computed } from 'vue';
import { ApiService } from '@site/services/api-service';
import { FileAdapter } from '@site/services/entity-adapter';
import { useAsyncState } from '@vueuse/core';

const api = new ApiService();

export const useFilesStore = defineStore('files', () => {
  type ViewMode = 'list' | 'grid' | 'dense';
  const viewMode = ref<ViewMode>('dense');
  const filter = ref<FilesFilter>(FilesFilter.empty());
  const sort = ref<string>('');

  const {
    state: rawFiles,
    isLoading,
    error,
    execute: fetch,
  } = useAsyncState(async () => {
    const res = await api.fetchFiles();
    return FileAdapter.listFromBackend(res.data.data);
  }, []);

  const filteredFiles = computed(() => {
    let result = rawFiles.value;
    if (filter.value.isEmpty) return result;

    const { name, createdAt } = filter.value;

    if (name && name.operator && name.condition) {
      const condition = name.condition.toLowerCase();
      if (name.operator === 'contains') {
        result = result.filter((f) => f.name.toLowerCase().includes(condition));
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
  });

  return {
    viewMode: computed(() => viewMode.value),
    filter: computed(() => filter.value),
    sort: computed(() => sort.value),
    filteredFiles,
    loading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchFiles: fetch,
    setViewMode(mode: ViewMode): void {
      viewMode.value = mode;
    },
    setFilter(newFilter: FilesFilter): void {
      filter.value = newFilter;
    },
    resetFilter(): void {
      filter.value = FilesFilter.empty();
    },
    clearRawFiles(): void {
      rawFiles.value = [];
    },
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot));
}
