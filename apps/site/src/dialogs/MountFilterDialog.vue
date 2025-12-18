<script setup lang="ts">
import { Form, FormInstance, FormSubmitEvent } from '@primevue/forms';
import { MountColumns, ObjectsFilter } from '@site/models';
import { useListViewStore } from '@site/stores/list-view';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';

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
const route = useRoute();

const actions = MountColumns;

const textOptions = [
  { label: 'Contains', value: 'contains' },
  { label: 'Does not contain', value: 'notContains' },
];

const initialValues = computed(() => {
  return filter.value.toFlattenObj();
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
  if (valid) {
    emits('update:visible', false);
    const newFilter = ObjectsFilter.fromQuery(values);
    navigate(newFilter);
  }
}

function navigate(filter: ObjectsFilter) {
  router.push({
    path: route.path,
    query: filter.toQuery(),
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
            v-if="!$form[key]?.operator?.value"
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
            :placeholder="`If ${label}...`"
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
          <DatePicker :name="`${key}.start`" placeholder="Range Start" fluid />
          <DatePicker :name="`${key}.end`" placeholder="Range End" fluid />
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
