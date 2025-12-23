import { defineStore, acceptHMRUpdate } from 'pinia';
import { UploadTask, UploadStatus, UploadProgress } from '@site/models';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { nanoid } from 'nanoid';

export const useUploadStore = defineStore('upload', () => {
  const tasks = ref<UploadTask[]>([]);
  const isCollapsed = ref(true);
  const MAX_CONCURRENT_UPLOADS = 3;

  // 存儲任務元數據
  const { data: persistedTasks, isFinished } = useIDBKeyval<UploadTask[]>(
    'upload_tasks',
    [],
    { deep: true }
  );

  // 存儲 File 物件
  const { data: persistedFiles } = useIDBKeyval<Record<string, File>>(
    'upload_files',
    {},
    { deep: true }
  );

  const filesMap = ref<Record<string, File>>({});

  // 恢復任務時，同時恢復 File 物件
  watch(
    [persistedTasks, persistedFiles, isFinished],
    ([newTasks, newFiles, finished]) => {
      if (finished && newTasks && newTasks.length > 0) {
        tasks.value = newTasks.map((task) => ({
          ...task,
          status:
            task.status === UploadStatus.UPLOADING
              ? UploadStatus.PAUSED
              : task.status,
        }));

        if (newFiles) {
          filesMap.value = newFiles;
        }
      }
    },
    { immediate: true }
  );

  // 持久化任務元數據
  watch(
    tasks,
    (newTasks) => {
      persistedTasks.value = newTasks;
    },
    { deep: true }
  );

  // 持久化 File 物件
  watch(
    filesMap,
    (newFiles) => {
      persistedFiles.value = newFiles;
    },
    { deep: true }
  );

  const activeTasks = computed(() =>
    tasks.value.filter(
      (t) =>
        t.status !== UploadStatus.COMPLETED &&
        t.status !== UploadStatus.CANCELLED
    )
  );

  const uploadingTasks = computed(() =>
    tasks.value.filter((t) => t.status === UploadStatus.UPLOADING)
  );

  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.status === UploadStatus.COMPLETED)
  );

  const hasActiveUploads = computed(() =>
    tasks.value.some((t) => t.status === UploadStatus.UPLOADING)
  );

  const totalProgress = computed(() => {
    const active = activeTasks.value;
    if (active.length === 0) return 0;

    const total = active.reduce((sum, task) => {
      const file = task.file;
      return sum + (file?.size || 0);
    }, 0);

    const uploaded = active.reduce((sum, task) => {
      return sum + task.uploadedBytes;
    }, 0);

    return total > 0 ? Math.round((uploaded / total) * 100) : 0;
  });

  function createTask(params: {
    sessionId: string;
    file: File;
    targetPath: string;
    readableName: string;
  }): UploadTask {
    const now = new Date().toISOString();
    const taskId = nanoid();
    const task: UploadTask = {
      id: taskId,
      sessionId: params.sessionId,
      file: {
        name: params.file.name,
        size: params.file.size,
        type: params.file.type,
        lastModified: params.file.lastModified,
      },
      targetPath: params.targetPath,
      readableName: params.readableName,
      uploadedBytes: 0,
      status: UploadStatus.PENDING,
      priority: tasks.value.length,
      createdAt: now,
      updatedAt: now,
    };

    // 存儲 File 物件
    filesMap.value[taskId] = params.file;

    tasks.value.push(task);
    return task;
  }

  function updateTask(taskId: string, updates: Partial<UploadTask>): void {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = {
        ...tasks.value[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  function removeTask(taskId: string): void {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value.splice(index, 1);
      // 刪除對應的 File 物件
      delete filesMap.value[taskId];
    }
  }

  function pauseTask(taskId: string): void {
    updateTask(taskId, { status: UploadStatus.PAUSED });
  }

  function resumeTask(taskId: string): void {
    updateTask(taskId, { status: UploadStatus.PENDING });
  }

  function cancelTask(taskId: string): void {
    updateTask(taskId, { status: UploadStatus.CANCELLED });
  }

  function clearCompletedTasks(): void {
    const completedTaskIds = tasks.value
      .filter((t) => t.status === UploadStatus.COMPLETED)
      .map((t) => t.id);

    tasks.value = tasks.value.filter(
      (t) => t.status !== UploadStatus.COMPLETED
    );

    // 刪除對應的 File 物件
    completedTaskIds.forEach((id) => {
      delete filesMap.value[id];
    });
  }

  function increasePriority(taskId: string): void {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index > 0) {
      const task = tasks.value[index];
      const prevTask = tasks.value[index - 1];

      const tempPriority = task.priority;
      task.priority = prevTask.priority;
      prevTask.priority = tempPriority;

      tasks.value[index] = prevTask;
      tasks.value[index - 1] = task;
    }
  }

  function decreasePriority(taskId: string): void {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index < tasks.value.length - 1) {
      const task = tasks.value[index];
      const nextTask = tasks.value[index + 1];

      const tempPriority = task.priority;
      task.priority = nextTask.priority;
      nextTask.priority = tempPriority;

      tasks.value[index] = nextTask;
      tasks.value[index + 1] = task;
    }
  }

  function toggleCollapse(): void {
    isCollapsed.value = !isCollapsed.value;
  }

  function getFile(taskId: string): File | undefined {
    return filesMap.value[taskId];
  }

  return {
    tasks: computed(() => tasks.value),
    activeTasks,
    uploadingTasks,
    completedTasks,
    hasActiveUploads,
    totalProgress,
    isCollapsed: computed(() => isCollapsed.value),
    createTask,
    updateTask,
    removeTask,
    pauseTask,
    resumeTask,
    cancelTask,
    clearCompletedTasks,
    increasePriority,
    decreasePriority,
    toggleCollapse,
    getFile,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUploadStore, import.meta.hot));
}
