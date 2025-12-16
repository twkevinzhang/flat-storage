<script setup lang="ts">
import { MountColumns } from '@site/models';

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

const columns = ref(MountColumns);
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(val: boolean) => emits('update:visible', val)"
    header="Order"
    modal
    pt:root:class="w-md h-3/4"
  >
    <OrderList v-model="columns" dataKey="key">
      <template #option="{ option }">
        {{ option.label }}
      </template>
    </OrderList>
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
