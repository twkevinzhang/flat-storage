<script setup lang="ts">
import { Form, FormInstance, FormSubmitEvent } from '@primevue/forms';
import { MountColumns, ObjectsFilter } from '@site/models';
import { useListViewStore } from '@site/stores/list-view';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const { visible } = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const formRef = ref<FormInstance | null>(null);
const store = useListViewStore();
const { filter } = storeToRefs(store);
const router = useRouter();

const actions = MountColumns;

const textOptions = [
  { label: 'Contains', value: 'contains' },
  { label: 'Does not contain', value: 'notContains' },
];

const initialValues = computed(() => {
  const f = filter.value;
  return {
    'name.operator': f.name.operator,
    'name.condition': f.name.condition,
    'createdAt.start': f.createdAt.start
      ? f.createdAt.start.toISOString()
      : null,
    'createdAt.end': f.createdAt.end ? f.createdAt.end.toISOString() : null,
  };
});

function clean(...columns: string[]) {
  if (formRef && formRef.value) {
    for (const key of columns) {
      formRef.value.setFieldValue(key, null);
    }
  }
}

function reset() {
  if (formRef && formRef.value) {
    for (const [key, value] of Object.entries(initialValues.value)) {
      formRef.value.setFieldValue(key, value);
    }
  }
}

function submit({ valid, values }: FormSubmitEvent) {
  console.log('Form Submitted with values:', values);
  if (valid) {
    emits('update:visible', false);
    const newObj = ObjectsFilter.empty();
    merge(newObj, filter.value, values);
    navigate(newObj);
  }
}

function navigate(filter: ObjectsFilter) {
  router.push({
    query: filter,
  });
}
</script>

<template>
  <Form
    ref="formRef"
    v-slot="$form"
    @submit="submit"
    :initialValues="initialValues"
  >
    <Dialog
      :visible="visible"
      @update:visible="(val: boolean) => emits('update:visible', val)"
      header="Filter"
      modal
      pt:root:class="w-md h-3/4"
    >
      <Fieldset
        v-for="{ label, type, key } in actions"
        :legend="label"
        :toggleable="true"
      >
        <div v-if="type === 'text'" class="flex flex-col gap-4">
          <Select
            :name="`${key}.operator`"
            :options="textOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="`If ${label}...`"
            fluid
          />
          <InputText
            v-if="!!!$form[key]?.operator.value"
            :disabled="true"
            type="text"
            fluid
          />
          <InputText
            v-else
            :disabled="false"
            :name="`${key}.condition`"
            type="text"
            fluid
            :placeholder="`If ${label} ${
              $form[key].operator.value?.label ?? ''
            }...`"
          />
          <div class="flex justify-end">
            <Button
              severity="secondary"
              label="Clean"
              variant="text"
              @click="(e) => clean(`${key}.operator`, `${key}.condition`)"
            />
          </div>
        </div>

        <div v-if="type === 'date'" class="flex flex-col gap-4">
          <DatePicker :name="`${key}.start`" placeholder="Empty" fluid />
          <DatePicker :name="`${key}.end`" placeholder="Empty" fluid />
          <div class="flex justify-end">
            <Button
              severity="secondary"
              label="Clean"
              variant="text"
              @click="(e) => clean(`${key}.start`, `${key}.end`)"
            />
          </div>
        </div>
      </Fieldset>
      <template #footer>
        <Button
          severity="secondary"
          label="Reset"
          type="reset"
          variant="text"
          @click="(e) => reset()"
        />
        <Button label="Save" variant="text" @click="(e) => formRef?.submit()" />
      </template>
    </Dialog>
  </Form>
</template>
