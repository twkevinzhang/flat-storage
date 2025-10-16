<script setup lang="ts">
const SidebarIconList = [
  { id: 'explorer', icon: '📁', label: 'Explorer' },
  { id: 'starred', icon: '⭐', label: 'Starred' },
  { id: 'history', icon: '⏱️', label: 'History' },
];
const active = ref<string | null>(SidebarIconList[0].id);
const sidebarOpen = computed(() => active.value !== null);

function setActive(id: string) {
  if (active.value === id) {
    active.value = null;
  } else {
    active.value = id;
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- IconBar -->
    <div
      class="flex flex-col items-center w-14 bg-gray-900 text-white py-2 space-y-2"
    >
      <button
        v-for="icon in SidebarIconList"
        :key="icon.id"
        @click="setActive(icon.id)"
        :class="[
          active === icon.id ? 'bg-gray-700' : '',
          'w-10 h-10 flex items-center justify-center rounded hover:bg-gray-700 transition',
        ]"
        :title="icon.label"
      >
        <span class="text-2xl">{{ icon.icon }}</span>
      </button>
    </div>
    <!-- Sidebar -->
    <div
      v-if="sidebarOpen"
      class="w-64 bg-white border-r flex flex-col transition-all duration-300"
    >
      <slot name="sidebar" :icon="active" />
    </div>
    <!-- Main Content -->
    <div class="flex-1 p-6">
      <slot name="content" />
    </div>
  </div>
</template>
