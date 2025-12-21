import { ColumnKeys, Columns, ObjectEntity, ObjectsFilter } from '@site/models';

export const useListViewStore = defineStore('list-view', () => {
  const path = ref<string>('');
  const filter = ref<ObjectsFilter>(ObjectsFilter.empty());
  const sortRules = ref<{ key: string; order: 'asc' | 'desc' }[]>([]);
  const columnOrder = ref<ColumnKeys[]>([]);
  const hiddenColumns = ref<ColumnKeys[]>([]);
  const rawList = ref<ObjectEntity[]>([]);

  return {
    // =====
    // Path
    // =====

    setPath(newPath: string): void {
      path.value = newPath;
    },
    path: computed(() => path.value),
    name: computed(() => path.value.split('/').pop() || ''),

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
      hiddenColumns.value = Columns.filter(
        (c) => !showColumns.includes(c.key)
      ).map((c) => c.key);
    },
    hiddenColumns: computed(() => hiddenColumns.value),
    hiddenColumnsCount: computed(() => hiddenColumns.value.length),
    visibleColumns: computed(() => {
      const source =
        columnOrder.value.length > 0
          ? (columnOrder.value
              .map((key) => Columns.find((c) => c.key === key))
              .filter(Boolean) as typeof Columns)
          : Columns;

      return source.map((c) => ({
        ...c,
        visible: !hiddenColumns.value.includes(c.key),
      }));
    }),
    activeColumns: computed(() => {
      const source =
        columnOrder.value.length > 0
          ? (columnOrder.value
              .map((key) => Columns.find((c) => c.key === key))
              .filter(Boolean) as typeof Columns)
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
      let result = pathIt(rawList.value, path.value);
      result = filterIt(result, filter.value);
      result = sortIt(result, sortRules.value);
      return result;
    }),
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useListViewStore, import.meta.hot));
}

export function pathIt(entities: ObjectEntity[], path: string): ObjectEntity[] {
  // remove mount
  path = removeLeadingPart(path);

  // filter by path level
  if (path === '/') {
    return entities.filter((d: ObjectEntity) => count(d.path, '/') === 1);
  }

  const result = entities.filter((item: ObjectEntity) => {
    if (!item.path.startsWith(path + '/')) return false;

    const itemSlashes = count(item.path, '/');
    const pathSlashes = count(path, '/');
    return itemSlashes === pathSlashes + 1;
  });

  return result;
}

function filterIt(raw: ObjectEntity[], f: ObjectsFilter): ObjectEntity[] {
  if (!f || f.isEmpty) return raw;
  if (!raw || raw.length === 0) return [];

  let result = raw;

  for (const rule of f.rules) {
    const { key, operator, value, start, end } = rule;
    const col = Columns.find((c) => c.key === key);
    if (!col) continue;

    if (col.type === 'text') {
      const condition = (value || '').toLowerCase();
      if (operator === 'contains') {
        result = result.filter((obj) =>
          (obj as any)[key]?.toLowerCase().includes(condition)
        );
      } else if (operator === 'notContains') {
        result = result.filter(
          (obj) => !(obj as any)[key]?.toLowerCase().includes(condition)
        );
      } else if (operator === 'equals') {
        result = result.filter(
          (obj) => (obj as any)[key]?.toLowerCase() === condition
        );
      }
    } else if (col.type === 'date') {
      if (start) {
        result = result.filter((obj) => {
          const val = (obj as any)[key];
          if (!val) return false;
          const d = val instanceof Date ? val : new Date(val);
          return d >= start;
        });
      }
      if (end) {
        result = result.filter((obj) => {
          const val = (obj as any)[key];
          if (!val) return false;
          const d = val instanceof Date ? val : new Date(val);
          return d <= end;
        });
      }
    } else if (col.type === 'number') {
      const numVal = Number(value);
      if (isNaN(numVal)) continue;
      if (operator === 'equals') {
        result = result.filter((obj) => (obj as any)[key] === numVal);
      } else if (operator === 'gt') {
        result = result.filter((obj) => (obj as any)[key] > numVal);
      } else if (operator === 'lt') {
        result = result.filter((obj) => (obj as any)[key] < numVal);
      }
    }
  }

  return result;
}

function sortIt(
  data: ObjectEntity[],
  sortRules: { key: string; order: 'asc' | 'desc' }[]
): ObjectEntity[] {
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
