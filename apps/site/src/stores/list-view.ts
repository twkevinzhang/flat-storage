import { defineStore, acceptHMRUpdate } from 'pinia';
import { ColumnKeys, Columns, ObjectEntity, ObjectsFilter } from '@site/models';

export const useListViewStore = defineStore('list-view', () => {
  const filter = ref<ObjectsFilter>(ObjectsFilter.empty());
  const sort = ref<string>('');
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
    // Order & Visibility
    // =====

    setOrder(newOrder: ColumnKeys[]): void {
      columnOrder.value = newOrder;
    },
    setVisibleColumns(showColumns: ColumnKeys[]): void {
     hiddenColumns.value = Columns.filter(c => !showColumns.includes(c.key)).map(c => c.key);
    },
    hiddenColumns: computed(() => hiddenColumns.value),
    hiddenColumnsCount: computed(() => hiddenColumns.value.length),
    visibleColumns: computed(() => {
      // Use custom order if exists, otherwise default Columns
      const source = columnOrder.value.length > 0 
        ? columnOrder.value.map(key => Columns.find(c => c.key === key)).filter(Boolean) as typeof Columns
        : Columns;
      
      return source.map(c => ({
        ...c,
        visible: !hiddenColumns.value.includes(c.key)
      }));
    }),
    activeColumns: computed(() => {
      // Use custom order if exists, otherwise default Columns
      const source = columnOrder.value.length > 0 
        ? columnOrder.value.map(key => Columns.find(c => c.key === key)).filter(Boolean) as typeof Columns
        : Columns;
      return source.filter((c) => !hiddenColumns.value.includes(c.key));
    }),

    order: computed(() => columnOrder.value),
    
    // =====
    // Sort
    // =====

    setSort(): void {},
    sort: computed(() => sort.value),
    
    // =====
    // Stateful List
    // =====

    setList(data: ObjectEntity[]): void {
      rawList.value = data;
    },
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
