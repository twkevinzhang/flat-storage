<script setup lang="ts">
const State = ['asc', 'off', 'desc'] as const;
export type TriState = (typeof State)[number];

const { modelValue, disabled, label } = defineProps({
  modelValue: {
    type: String as PropType<TriState>,
    default: 'off',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue'] as const);

const current = ref<TriState>(modelValue as TriState);

watch(
  () => modelValue,
  (val) => {
    if (val) current.value = val;
  }
);

const toggle = () => {
  if (disabled) return;
  const idx = State.indexOf(current.value);
  const next = State[(idx + 1) % State.length];
  emit('update:modelValue', next);
};

const stateLabel = computed(() => {
  switch (current.value) {
    case 'asc':
      return 'asc';
    case 'off':
      return 'off';
    case 'desc':
      return 'desc';
  }
});

// Determine knob translation and colors for three positions
const knobTranslateClass = computed(() => {
  // using translate-x-0, translate-x-5, translate-x-10 to make three positions
  switch (current.value) {
    case 'asc':
      return 'translate-x-0';
    case 'off':
      return 'translate-x-5';
    case 'desc':
      return 'translate-x-10';
  }
});

const trackColorClass = computed(() => {
  switch (current.value) {
    case 'asc':
      return 'bg-sky-500 border-sky-600';
    case 'off':
      return 'bg-amber-400 border-amber-500';
    case 'desc':
      return 'bg-white border-gray-300 hover:border-gray-400';
  }
});
</script>

<template>
  <div class="flex items-center gap-3">
    <span v-if="label" class="text-gray-700 text-sm select-none">
      {{ label }}
    </span>
    <div
      class="flex items-center gap-2 cursor-pointer select-none"
      @click="(e) => toggle"
    >
      <span class="text-gray-500 text-sm">{{ stateLabel }}</span>

      <div
        :class="[
          'relative inline-flex w-16 h-6 rounded-full border transition-all duration-200 ease-in-out',
          trackColorClass,
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
      >
        <span
          :class="[
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white border border-gray-300 shadow-sm transition-transform duration-200 ease-in-out',
            knobTranslateClass,
          ]"
        ></span>
      </div>
    </div>
  </div>
</template>
