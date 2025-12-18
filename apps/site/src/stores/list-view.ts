import { defineStore, acceptHMRUpdate } from 'pinia';
import { ObjectEntity, ObjectsFilter } from '@site/models';

export const useListViewStore = defineStore('list-view', () => {
  const filter = ref<ObjectsFilter>(ObjectsFilter.empty());
  const sort = ref<string>('');
  const order = ref('');
  const rawList = ref<ObjectEntity[]>([]);

  return {
    setList: (data: ObjectEntity[]) => {
      rawList.value = data;
    },
    setFilter(newFilter: ObjectsFilter): void {
      filter.value = newFilter;
    },
    setSort(): void {},
    setOrder(): void {},
    filter: computed(() => filter.value),
    filterCount: computed(() => {
      if (filter.value.isEmpty) return undefined;
      return filter.value.count?.toString();
    }),
    sort: computed(() => sort.value),
    order: computed(() => order.value),

    statefulList: computed(() => {
      let result = filterIt(rawList.value, filter.value);
      return result;
    }),
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useListViewStore, import.meta.hot));
}

function filterIt(raw: ObjectEntity[], f: ObjectsFilter): ObjectEntity[] {
  if (f.isEmpty) return raw;
  if (!raw) return [];
  if (isEmpty(raw)) return [];
  if (f.isEmpty) return raw;
  let result = raw;

  const { name, createdAt } = f;

  if (name && name.operator && name.condition) {
    const condition = name.condition.toLowerCase();
    if (name.operator === 'contains') {
      result = result.filter((f) => f.name.toLowerCase().includes(condition));
    } else if (name.operator === 'notContains') {
      result = result.filter((f) => !f.name.toLowerCase().includes(condition));
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
}
