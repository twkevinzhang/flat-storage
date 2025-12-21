import { ObjectEntity, SessionEntity } from '@site/models';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { proxyMetadataFile } from '@site/utilities/storage';
import { decodeProxyBuffer } from '@site/utilities';

export const useMetadataStore = defineStore('metadata', () => {
  const currentSessionId = ref<string | null>(null);

  // Use useIDBKeyval for persistent storage
  // Note: we store plain objects and re-instantiate ObjectEntity on access/load
  const { data: cachedData, isFinished } = useIDBKeyval<{
    entities: any[];
    updatedAt: string;
  } | null>(
    computed(() => `metadata_${currentSessionId.value || 'none'}`).value,
    null,
    {
      deep: true,
    }
  );

  const entities = ref<ObjectEntity[]>([]);
  const isLoading = ref(false);
  const lastUpdated = computed(() => cachedData.value?.updatedAt || null);

  // Sync internal entities ref when cachedData changes (initial load or IDB update)
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
    if (!session) return;
    currentSessionId.value = session.id;

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
      console.log('Fetching metadata from GCS...');
      const [content] = await proxyMetadataFile(session).download();
      const contentStr = decodeProxyBuffer(content);
      const newEntitiesList = ObjectEntity.ArrayfromJson(contentStr);

      const updatedAt = new Date().toISOString();

      // Update IDB directly (which will trigger the watch and update entities.value)
      cachedData.value = {
        entities: newEntitiesList.map((e) => JSON.parse(e.toJson())),
        updatedAt,
      };
    } catch (error) {
      console.error('Failed to load metadata:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function refresh(session: SessionEntity) {
    await load(session, true);
  }

  function clear() {
    currentSessionId.value = null;
    entities.value = [];
  }

  return {
    entities,
    isLoading,
    lastUpdated,
    load,
    refresh,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot));
}
