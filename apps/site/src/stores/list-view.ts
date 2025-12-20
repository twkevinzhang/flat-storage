import { defineStore, acceptHMRUpdate } from 'pinia';
import { ColumnKeys, Columns, ObjectEntity, ObjectsFilter } from '@site/models';

export const useListViewStore = defineStore('list-view', () => {
  const filter = ref<ObjectsFilter>(ObjectsFilter.empty());
  const sortRules = ref<{ key: string; order: 'asc' | 'desc' }[]>([]);
  const columnOrder = ref<ColumnKeys[]>([]);
  const hiddenColumns = ref<ColumnKeys[]>([]);
  const rawList = ref<ObjectEntity[]>([]);

  return {

    // =====
    // Filter
    // =====

    setFilter(newFilter: ObjectsFilter): void {
      filter.value = newFilter;
    },
    filter: computed(() => filter.value),
    filterCount: computed(() => {
      if (filter.value.isEmpty) return undefined;
      return filter.value.count?.toString();
    }),

    
    // =====
    // Order
    // =====

    setOrder(newOrder: ColumnKeys[]): void {
      columnOrder.value = newOrder;
    },
    order: computed(() => columnOrder.value),

    // =====
    // Visibility
    // =====

    setVisibleColumns(showColumns: ColumnKeys[]): void {
     hiddenColumns.value = Columns.filter(c => !showColumns.includes(c.key)).map(c => c.key);
    },
    hiddenColumns: computed(() => hiddenColumns.value),
    hiddenColumnsCount: computed(() => hiddenColumns.value.length),
    visibleColumns: computed(() => {
      const source = columnOrder.value.length > 0 
        ? columnOrder.value.map(key => Columns.find(c => c.key === key)).filter(Boolean) as typeof Columns
        : Columns;
      
      return source.map(c => ({
        ...c,
        visible: !hiddenColumns.value.includes(c.key)
      }));
    }),
    activeColumns: computed(() => {
      const source = columnOrder.value.length > 0 
        ? columnOrder.value.map(key => Columns.find(c => c.key === key)).filter(Boolean) as typeof Columns
        : Columns;
      return source.filter((c) => !hiddenColumns.value.includes(c.key));
    }),

    
    // =====
    // Sort
    // =====

    setSortRules(newSort: { key: string; order: 'asc' | 'desc' }[]): void {
      sortRules.value = newSort;
    },
    sortRules: computed(() => sortRules.value),
    sortRulesCount: computed(() => {
      if (sortRules.value.length === 0) return undefined;
      return sortRules.value.length?.toString();
    }),
    
    // =====
    // Stateful List
    // =====

    setList(data: ObjectEntity[]): void {
      rawList.value = data;
    },
    statefulList: computed(() => {
      let result = filterIt(rawList.value, filter.value);
      result = sortIt(result, sortRules.value);
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

function sortIt(data: ObjectEntity[], sortRules: { key: string; order: 'asc' | 'desc' }[]): ObjectEntity[] {
  if (!sortRules || sortRules.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const rule of sortRules) {
      const { key, order } = rule;
      const valA = (a as any)[key];
      const valB = (b as any)[key];

      if (valA === valB) continue;
      
      // Handle null/undefined
      if (valA === null || valA === undefined) return order === 'asc' ? 1 : -1;
      if (valB === null || valB === undefined) return order === 'asc' ? -1 : 1;

      const comparison = valA > valB ? 1 : -1;
      return order === 'asc' ? comparison : -comparison;
    }
    return 0;
  });
}
