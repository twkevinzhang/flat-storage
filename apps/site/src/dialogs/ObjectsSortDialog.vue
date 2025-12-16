<script setup lang="ts">
const { visible } = defineProps<{
  visible: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

function reset() {}

function submit() {
  console.log('submitted');
}

const allOptions = computed(() => {
  return [
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
});

const avaliableOptions = computed(() => {
  return allOptions.value.filter(
    (c) => !sort.value.find((s) => s.key === c.key)
  );
});

const sort = ref<{ key: string; order: 'asc' | 'desc' }[]>([]);
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(val: boolean) => emits('update:visible', val)"
    header="Sort"
    modal
    pt:root:class="w-md h-3/4"
  >
    <template v-if="isEmpty(sort)">
      <Hover
        v-if="!isEmpty(avaliableOptions)"
        label="Add Sort..."
        severity="list-item"
        fluid
        icon="pi-plus"
        @click="
          (e) => {
            sort.push({
              key: avaliableOptions[0].key,
              order: 'asc',
            });
          }
        "
      />
    </template>
    <template v-else>
      <div class="flex flex-col gap-4">
        <Panel v-for="(s, index) in sort" :key="index">
          <div class="flex flex-col gap-2">
            <Select
              :options="
                avaliableOptions.concat(
                  allOptions.filter((c) => c.key === s.key)
                )
              "
              optionLabel="label"
              optionValue="key"
              v-model="s.key"
              fluid
            />
            <SelectButton
              :options="[
                { icon: 'sort-alpha-down', value: 'asc' },
                { icon: 'sort-alpha-up', value: 'desc' },
              ]"
              optionLabel="value"
              optionValue="value"
              v-model="s.order"
              fluid
            >
              <template #option="{ option }">
                <PrimeIcon :name="option.icon" size="large" />
              </template>
            </SelectButton>
            <div class="flex justify-end">
              <Button
                class="!justify-end"
                icon="pi pi-trash"
                severity="secondary"
                variant="text"
                label="Remove"
                @click="
                  (e) => {
                    sort.splice(index, 1);
                  }
                "
              />
            </div>
          </div>
        </Panel>
        <Hover
          v-if="!isEmpty(avaliableOptions)"
          label="Add Sort..."
          severity="list-item"
          fluid
          icon="pi-plus"
          @click="
            (e) => {
              sort.push({
                key: avaliableOptions[0].key,
                order: 'asc',
              });
            }
          "
        />
      </div>
    </template>
    <template #footer>
      <Button
        severity="secondary"
        label="Reset"
        type="reset"
        variant="text"
        @click="(e) => reset()"
      />
      <Button label="Save" type="submit" variant="text" />
    </template>
  </Dialog>
</template>
