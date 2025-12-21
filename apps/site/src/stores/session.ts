import { acceptHMRUpdate, defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { SessionEntity } from '@site/models';

export const useSessionStore = defineStore('session', () => {
  const sessions = useLocalStorage<SessionEntity[]>('sessions', []);

  function add(session: SessionEntity) {
    sessions.value.push(session);
  }

  function remove(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id);
  }

  function get(id: string) {
    // Note: useLocalStorage returns an array of plain objects, we might need to re-instantiate
    const found = sessions.value.find((s) => s.id === id);
    if (!found) return null;
    return found;
  }

  function update(id: string, params: Partial<SessionEntity>) {
    const index = sessions.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      const updated = { ...sessions.value[index], ...params };
      // Explicitly delete instance properties to satisfy plain object storage if needed,
      // but here we just need to ensure the type matches the storage array.
      sessions.value[index] = updated as SessionEntity;
    }
  }

  return {
    sessions,
    add,
    remove,
    get,
    update,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot));
}
