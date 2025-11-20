<script setup lang="ts">
import { Form, FormSubmitEvent } from '@primevue/forms';

const { visible } = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

function reset(actionKey: string) {}

function submit({ valid, values }: FormSubmitEvent) {
  console.log('valid', valid);
  console.log('values', values);
}

const actions = [
  {
    label: 'Name',
    key: 'name',
    icon: '',
    type: 'text',
  },
  {
    label: 'Created At',
    key: 'createdAt',
    icon: '',
    type: 'date',
  },
];
</script>

<template>
  <Form v-slot="$form" @submit="submit">
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
            :options="[
              { label: 'Contains', value: 'contains' },
              { label: 'Does not contain', value: 'notContains' },
            ]"
            optionLabel="label"
            :placeholder="`If ${label}...`"
            fluid
          />
          <InputText
            v-if="!!!$form[key]?.operator.value"
            :disabled="true"
            :name="`${key}.condition`"
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
            <SecondaryButton
              label="Reset"
              type="reset"
              variant="text"
              @click="(e) => reset(key)"
            />
          </div>
        </div>

        <div v-if="type === 'date'" class="flex flex-col gap-4">
          <DatePicker :name="`${key}.start`" placeholder="Empty" fluid />
          <DatePicker :name="`${key}.end`" placeholder="Empty" fluid />
          <div class="flex justify-end">
            <SecondaryButton
              label="Reset"
              type="reset"
              variant="text"
              @click="(e) => reset(key)"
            />
          </div>
        </div>
      </Fieldset>
      <template #footer>
        <Button label="Save" type="submit" variant="text" />
      </template>
    </Dialog>
  </Form>
</template>
