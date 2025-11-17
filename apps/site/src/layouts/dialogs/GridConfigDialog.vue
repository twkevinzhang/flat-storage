<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const viewMode = ref<'list' | 'grid' | 'dense'>('list');
const thumbnailMode = ref<'on' | 'off'>('on');
const sort = ref('asc');
const value = ref('');
</script>

<template>
  <div
    v-if="props.open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="bg-white rounded-lg shadow-lg w-[380px] max-w-[90%] p-6">
      <!-- body -->
      <div class="space-b-4">
        <Fieldset legend="檢視">
          <SelectButton
            size="large"
            class="w-full"
            v-model="value"
            :options="[
              { icon: 'pi pi-list', name: '清單', value: 'list' },
              { icon: 'pi pi-th-large', name: '網格', value: 'grid' },
            ]"
            optionLabel="name"
            dataKey="value"
          >
            <template #option="slotProps">
              <i :class="slotProps.option.icon"></i>
            </template>
          </SelectButton>
        </Fieldset>
        <Fieldset legend="排列">
          <div v-for="section in ['名稱', '大小', '種類', '修改日期']">
            <label for="fluid" class="mt-2 mb-1 block">{{ section }}</label>
            <SelectButton
              class="w-full"
              fluid
              id="fluid"
              size="small"
              v-model="value"
              :options="[
                { name: '順序', value: 1 },
                { name: '無', value: 0 },
                { name: '逆序', value: 3 },
              ]"
              optionLabel="name"
            />
          </div>
        </Fieldset>
      </div>

      <!-- 底部按鈕 -->
      <div class="mt-6 flex justify-end">
        <SecondaryButton
          @click="(e) => emits('close')"
          label="取消"
          variant="text"
        />
        <Button @click="(e) => emits('close')" label="完成" />
      </div>
    </div>
  </div>
</template>
