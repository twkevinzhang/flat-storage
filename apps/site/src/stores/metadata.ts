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

  function moveFolder() {}

  function copyFolder() {}

  function lockFolder() {}

  function starFolder() {}

  function deleteFolder() {}

  async function renameFolder(
    session: SessionEntity,
    oldPath: string,
    newName: string
  ) {
    isLoading.value = true;
    oldPath = removeLeadingPart(oldPath);
    try {
      // 1. Identify all entities to be renamed (including self and descendants)
      // oldPath might be like '/mount/folder'
      const prefix = oldPath + '/';
      const affectedIndices: number[] = [];

      const newEntities = entities.value.map((e, index) => {
        if (e.path === oldPath || e.path.startsWith(prefix)) {
          // Calculate new path
          // If e.path is '/mount/folder/sub', and oldPath is '/mount/folder'
          // We need to replace '/mount/folder' with parentPath + '/' + newName
          const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
          const targetPrefix = joinPath(parentPath, newName);

          let updatedPath: string;
          if (e.path === oldPath) {
            updatedPath = targetPrefix;
          } else {
            updatedPath = targetPrefix + e.path.substring(oldPath.length);
          }

          // Return a new instance with updated path
          return ObjectEntity.new({
            ...JSON.parse(e.toJson()),
            path: updatedPath,
          });
        }
        return e;
      });

      // 2. Save to GCS
      await sessionApi.saveEntities(session, newEntities);

      // 3. Update local state (IDB & Ref)
      const updatedAt = new Date().toISOString();
      cachedData.value = {
        entities: newEntities.map((e) => JSON.parse(e.toJson())),
        updatedAt,
      };

      toast.add({
        severity: 'success',
        summary: 'Rename Success',
        detail: `Renamed to ${newName}`,
        life: 3000,
      });
    } catch (error: any) {
      console.error('Failed to rename folder:', error);
      toast.add({
        severity: 'error',
        summary: 'Rename Failed',
        detail: error.message || 'Failed to update metadata',
        life: 3000,
      });
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    allObjects: entities,
    isLoading,
    lastUpdated,
    loadObjects: load,
    renameFolder,
    refresh,
    clear,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetadataStore, import.meta.hot));
}
