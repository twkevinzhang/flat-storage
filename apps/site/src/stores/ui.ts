import { defineStore, acceptHMRUpdate } from 'pinia';

export const useUiStore = defineStore('ui', () => {
  const isSidebarPinned = useLocalStorage('isSidebarPinned', false);
  const sidebarWidth = useLocalStorage('sidebarWidth', 256);
  const viewMode = useLocalStorage<'grid' | 'list' | 'column'>(
    'viewMode',
    'list'
  );

  return {
    isSidebarPinned,
    sidebarWidth,
    viewMode,

    toggleSidebarPin() {
      isSidebarPinned.value = !isSidebarPinned.value;
    },
    setSidebarWidth(width: number) {
      sidebarWidth.value = width;
    },
    setViewMode(mode: 'grid' | 'list' | 'column') {
      viewMode.value = mode;
    },
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUiStore, import.meta.hot));
}
