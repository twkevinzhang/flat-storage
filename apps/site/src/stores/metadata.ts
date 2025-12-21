import { defineStore, acceptHMRUpdate } from 'pinia';
import { ObjectEntity, SessionEntity } from '@site/models';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { INJECT_KEYS } from '@site/services';
import { useToast } from 'primevue/usetoast';
import { SessionService } from '@site/services/session';

export const useMetadataStore = defineStore('metadata', () => {
  /**
   * =====
   * Data fetching and listener
   * =====
   */

  const sessionApi = inject<SessionService>(INJECT_KEYS.SessionService)!;
  const sessionId = ref<string | null>(null);
  const entities = ref<ObjectEntity[]>([]);
  const isLoading = ref(false);
  const toast = useToast();

  const idbKey = computed(() => `metadata_${sessionId.value || 'none'}`);
  const { data: cachedData, isFinished } = useIDBKeyval<{
    entities: any[];
    updatedAt: string;
  } | null>(idbKey.value, null, {
    deep: true,
  });

  const lastUpdated = computed(() => cachedData.value?.updatedAt || null);

  watch(
    [cachedData, isFinished],
    ([newData, finished]) => {
      if (finished && newData) {
        entities.value = newData.entities.map((e) => ObjectEntity.fromJson(e));
      } else if (finished && !newData) {
        entities.value = [];
      }
    },
    { immediate: true }
  );

  async function load(session: SessionEntity, force = false) {
    sessionId.value = session.id;

    // Wait for IDB to finish loading if it's the first time
    if (!isFinished.value) {
      await new Promise((resolve) => {
        const stop = watch(isFinished, (finished) => {
          if (finished) {
            stop();
            resolve(true);
          }
        });
      });
    }

    if (!force && entities.value.length > 0) {
      return;
    }

    isLoading.value = true;

    try {
      console.log('Fetching entities from GCS...');
      const list = await sessionApi.fetchEntities(session);
      const updatedAt = new Date().toISOString();

      // Update IDB directly
      cachedData.value = {
        entities: list.map((e) => JSON.parse(e.toJson())),
        updatedAt,
      };
    } catch (error: any) {
      console.error('Failed to load entities:', error);
      toast.add({
        severity: 'error',
        summary: 'Load Failed',
        detail: error.message || 'Failed to fetch entities file',
        life: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  }

  async function refresh(session: SessionEntity) {
    try {
      await load(session, true);
      toast.add({
        severity: 'success',
        summary: 'Refresh Success',
        detail: 'Metadata has been reloaded from GCS',
        life: 3000,
      });
    } catch (error: any) {
      // Error already handled in load()
    }
  }

  function clear() {
    sessionId.value = null;
    entities.value = [];
  }

  function renameFolder() {}

  function moveFolder() {}

  function copyFolder() {}

  function lockFolder() {}

  function starFolder() {}

  function deleteFolder() {}

  return {
    allObjects: entities,
    isLoading,
    lastUpdated,
    loadObjects: load,
    refresh,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot));
}
