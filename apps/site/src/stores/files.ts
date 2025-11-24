import { defineStore, acceptHMRUpdate } from 'pinia';
import { FilesFilter, mockFiles } from '@site/models';

export const useFilesStore = defineStore('files', () => {
  const filter = ref<FilesFilter>(FilesFilter.empty());
  const sort = ref<string>('');

  return {
    filter: computed(() => filter.value),
    sort: computed(() => sort.value),
    files: computed(() => {
      let result = mockFiles();
      if (filter.value.isEmpty) {
        return result;
      }

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
            (f: any) => new Date(f.createdAtISO) >= createdAt.start!
          );
          return result;
        }
        if (createdAt.end) {
          result = result.filter(
            (f: any) => new Date(f.createdAtISO) <= createdAt.end!
          );
          return result;
        }
      }

      return result;
    }),
    setFilter(newFilter: FilesFilter): void {
      filter.value = newFilter;
    },
    resetFilter(): void {
      filter.value = FilesFilter.empty();
    },
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFilesStore, import.meta.hot));
}
