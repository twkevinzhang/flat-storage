<script setup lang="ts">
import { Columns, ColumnKeys, ObjectsFilter, FilterRule } from '@site/models';
import { useListViewStore } from '@site/stores/list-view';

const props = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const store = useListViewStore();
const router = useRouter();
const route = useRoute();

const localRules = ref<FilterRule[]>([]);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // Clone rules from store
      localRules.value = store.filter.rules.map((r) => ({ ...r }));
    }
  },
  { immediate: true }
);

const textOptions = [
  { label: 'Contains', value: 'contains' },
  { label: 'Does not contain', value: 'notContains' },
  { label: 'Exactly matches', value: 'equals' },
];

const numberOptions = [
  { label: 'Equals', value: 'equals' },
  { label: 'Greater than', value: 'gt' },
  { label: 'Less than', value: 'lt' },
];

const isFilterEmpty = computed(() => isEmpty(localRules.value));

function handleAddFilterRule() {
  localRules.value.push({
    key: ColumnKeys.name,
    operator: 'contains',
    value: '',
  });
}

function handleRemoveFilterRule(index: number) {
  localRules.value.splice(index, 1);
}

function handleReset() {
  localRules.value = [];
}

function handleSubmit() {
  const newFilter = new ObjectsFilter(localRules.value);
  store.setFilter(newFilter);

  router.push({
    path: route.path,
    query: newFilter.toQuery(),
  });

  emits('update:visible', false);
}

function getColumn(key: ColumnKeys) {
  return Columns.find((c) => c.key === key);
}

function onKeyChange(rule: FilterRule) {
  const col = getColumn(rule.key);
  if (col?.type === 'text') {
    rule.operator = 'contains';
    rule.value = '';
  } else if (col?.type === 'number') {
    rule.operator = 'equals';
    rule.value = null;
  } else if (col?.type === 'date') {
    rule.operator = 'range';
    rule.start = null;
    rule.end = null;
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(val: boolean) => emits('update:visible', val)"
    header="Filter Rules"
    modal
    pt:root:class="w-md h-3/4"
  >
    <div class="flex flex-col gap-4 min-h-0 overflow-y-auto">
      <template v-if="isFilterEmpty">
        <Hover
          label="Add Filter Rule..."
          severity="list-item"
          icon="pi-plus"
          @click="handleAddFilterRule"
        />
        <div class="text-center py-8 text-surface-500 italic">
          No filters active. All items are visible.
        </div>
      </template>

      <template v-else>
        <Fieldset
          v-for="(rule, index) in localRules"
          :key="index"
          :legend="`Rule ${index + 1}`"
        >
          <div class="flex flex-col gap-3">
            <!-- Column Selector -->
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-surface-500 uppercase"
                >Column</label
              >
              <Select
                v-model="rule.key"
                :options="Columns"
                optionLabel="label"
                optionValue="key"
                fluid
                @change="onKeyChange(rule)"
              />
            </div>

            <!-- Operator and Value Inputs -->
            <div
              v-if="getColumn(rule.key)?.type === 'text'"
              class="flex flex-col gap-3"
            >
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-500 uppercase"
                  >Comparison</label
                >
                <Select
                  v-model="rule.operator"
                  :options="textOptions"
                  optionLabel="label"
                  optionValue="value"
                  fluid
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-500 uppercase"
                  >Value</label
                >
                <InputText
                  v-model="rule.value"
                  placeholder="Type text..."
                  fluid
                />
              </div>
            </div>

            <div
              v-else-if="getColumn(rule.key)?.type === 'number'"
              class="flex flex-col gap-3"
            >
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-500 uppercase"
                  >Comparison</label
                >
                <Select
                  v-model="rule.operator"
                  :options="numberOptions"
                  optionLabel="label"
                  optionValue="value"
                  fluid
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-500 uppercase"
                  >Value</label
                >
                <InputNumber
                  v-model="rule.value"
                  placeholder="Enter number..."
                  fluid
                />
              </div>
            </div>

            <div
              v-else-if="getColumn(rule.key)?.type === 'date'"
              class="flex flex-col gap-3"
            >
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-500 uppercase"
                  >Start Date</label
                >
                <DatePicker
                  v-model="rule.start"
                  placeholder="Range Start"
                  fluid
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-surface-500 uppercase"
                  >End Date</label
                >
                <DatePicker v-model="rule.end" placeholder="Range End" fluid />
              </div>
            </div>

            <!-- Remove Button -->
            <div class="flex justify-end pt-2">
              <Button
                icon="pi pi-trash"
                severity="danger"
                variant="text"
                label="Remove Rule"
                @click="handleRemoveFilterRule(index)"
              />
            </div>
          </div>
        </Fieldset>

        <Hover
          label="Add Another Filter Rule..."
          severity="list-item"
          icon="pi-plus"
          @click="handleAddFilterRule"
        />
      </template>
    </div>

    <template #footer>
      <Button
        severity="secondary"
        label="Clear All"
        variant="text"
        @click="handleReset"
      />
      <Button label="Apply Filters" variant="text" @click="handleSubmit" />
    </template>
  </Dialog>
</template>
