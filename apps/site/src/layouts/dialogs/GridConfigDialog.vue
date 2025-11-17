<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const viewMode = ref<'list' | 'grid' | 'dense'>('list');
const thumbnailMode = ref<'on' | 'off'>('on');
const sort = ref('asc');
</script>

<template>
  <div
    v-if="props.open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="bg-white rounded-lg shadow-lg w-[380px] max-w-[90%] p-6">
      <!-- body -->
      <div class="space-b-4">
        <div class="flex justify-between">
          <span class="text-xl font-bold">檢視</span>
          <Hover @click="emit('close')">
            <SvgIcon name="cross" :class-name="['size-5', 'fill-gray-500']" />
          </Hover>
        </div>
        <div class="grid grid-cols-2 gap-4 my-2">
          <Hover
            v-for="{ key, iconName } in [
              { key: 'list', iconName: 'list', label: '清單' },
              { key: 'grid', iconName: 'grid', label: '網格' },
            ]"
            :key="key"
            @click=""
            class-name="flex items-center justify-center p-4"
          >
            <SvgIcon :name="iconName" :class-name="['size-5']" />
          </Hover>
        </div>

        <div>
          <span class="text-xl font-bold">排列</span>
          <div class="grid grid-cols-3 gap-4 my-2">
            <div class="p-4">
              <ToggleSwitch v-model="sort" label="通知" />
              <p class="mt-2 text-gray-600"></p>
            </div>
            <Hover
              v-for="{ key, iconName } in [
                { key: 'list', iconName: 'cross', label: '清單' },
                { key: 'grid', iconName: 'cross', label: '網格' },
                { key: 'dense', iconName: 'cross', label: '詳細' },
              ]"
              :key="key"
              @click=""
              class-name="flex items-center justify-center p-4"
            >
              <SvgIcon :name="iconName" :class-name="['size-5']" />
            </Hover>
          </div>
        </div>
      </div>

      <!-- 底部按鈕 -->
      <div class="mt-6 flex justify-end">
        <Button class="px-4 py-2" @click="emit('close')"> 完成 </Button>
      </div>
    </div>
  </div>
</template>
