import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  DownloadTask,
  DownloadStatus,
  DownloadTaskFile,
} from '@site/models/DownloadTask';
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval';
import { useSessionStore } from './session';
import { proxyBucket } from '@site/utilities/storage';
import { downloadFile } from '@site/utilities/download';
import { SessionEntity } from '@site/models';

const MAX_CONCURRENT = 3;

class ProgressTracker {
  private lastBytes = 0;
  private lastTime = Date.now();
  private speeds: number[] = [];
  private readonly SPEED_SAMPLE_SIZE = 5;

  update(downloadedBytes: number) {
    const now = Date.now();
    const timeDiff = (now - this.lastTime) / 1000;
    const bytesDiff = downloadedBytes - this.lastBytes;

    if (timeDiff > 0) {
      const speed = bytesDiff / timeDiff;
      this.speeds.push(speed);
      if (this.speeds.length > this.SPEED_SAMPLE_SIZE) {
        this.speeds.shift();
      }
    }

    this.lastBytes = downloadedBytes;
    this.lastTime = now;
  }

  getSpeed(): number {
    if (isEmpty(this.speeds)) return 0;
    return this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length;
  }

  getETA(remainingBytes: number): number {
    const speed = this.getSpeed();
    return speed > 0 ? remainingBytes / speed : 0;
  }
}

export const useDownloadStore = defineStore('download', () => {
  const session = ref<SessionEntity | null>(null);

  // State
  const tasks = ref<DownloadTask[]>([]);
  const abortControllers = new Map<string, AbortController>();
  const progressTrackers = new Map<string, ProgressTracker>();

  // IndexedDB persistence
  const { data: persistedTasks, isFinished } = useIDBKeyval<string[]>(
    'download-tasks',
    [],
    { shallow: false }
  );

  const tasksIdb = computed({
    get: () => persistedTasks.value || [],
    set: (value: string[]) => {
      persistedTasks.value = value;
    },
  });

  // Computed
  const pendingTasks = computed(() =>
    tasks.value
      .filter((t) => t.status === DownloadStatus.PENDING)
      .sort((a, b) => a.priority - b.priority)
  );

  const downloadingTasks = computed(() =>
    tasks.value.filter((t) => t.status === DownloadStatus.DOWNLOADING)
  );

  const completedTasks = computed(() =>
    tasks.value.filter((t) => t.status === DownloadStatus.COMPLETED)
  );

  const failedTasks = computed(() =>
    tasks.value.filter(
      (t) =>
        t.status === DownloadStatus.FAILED ||
        t.status === DownloadStatus.EXPIRED
    )
  );

  const totalProgress = computed(() => {
    const total = tasks.value.reduce((sum, t) => sum + t.file.size, 0);
    const downloaded = tasks.value.reduce(
      (sum, t) => sum + t.downloadedBytes,
      0
    );
    return total > 0 ? (downloaded / total) * 100 : 0;
  });

  const averageSpeed = computed(() => {
    const speeds = downloadingTasks.value.map((t) => t.speed || 0);
    return speeds.length > 0
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0;
  });

  // Load tasks from IndexedDB
  watch(
    isFinished,
    (finished) => {
      if (finished && tasksIdb.value.length > 0) {
        tasks.value = tasksIdb.value.map((json) => DownloadTask.fromJson(json));
      }
    },
    { immediate: true }
  );

  // Persist tasks to IndexedDB
  watch(
    tasks,
    (newTasks) => {
      tasksIdb.value = newTasks
        .filter((t) => t.status !== DownloadStatus.COMPLETED)
        .map((t) => t.toJson());
    },
    { deep: true }
  );

  // Reactive scheduler
  watch([downloadingTasks, pendingTasks], ([downloading, pending]) => {
    const available = MAX_CONCURRENT - downloading.length;
    if (available > 0 && pending.length > 0) {
      const toStart = pending.slice(0, available);
      toStart.forEach((task) => startDownload(task.id));
    }
  });

  // Actions
  function addTask(file: DownloadTaskFile) {
    if (!session.value) {
      throw new Error('No active session');
    }

    const task = DownloadTask.new({
      sessionId: session.value.id,
      file,
    });

    tasks.value.push(task);
  }

  function addTasks(files: DownloadTaskFile[]) {
    files.forEach((file) => addTask(file));
  }

  async function startDownload(taskId: string) {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index === -1) return;

    const task = tasks.value[index];
    if (!session.value) return;

    try {
      // Update to downloading status directly (no need to fetch signed URL)
      tasks.value[index] = DownloadTask.merge(task, {
        status: DownloadStatus.DOWNLOADING,
        error: undefined,
      });

      // Get proxy download URL
      const bucket = proxyBucket(session.value);
      const file = bucket.file(task.file.path);
      const downloadUrl = file.getProxyDownloadUrl();

      // Create abort controller
      const controller = new AbortController();
      abortControllers.set(taskId, controller);

      // Create progress tracker
      const tracker = new ProgressTracker();
      progressTrackers.set(taskId, tracker);

      // Download with progress tracking
      await downloadFile(
        downloadUrl,
        task.file.relativePath,
        (downloadedBytes) => {
          const index = tasks.value.findIndex((t) => t.id === taskId);
          if (index === -1) return;

          tracker.update(downloadedBytes);
          const speed = tracker.getSpeed();
          const eta = tracker.getETA(task.file.size - downloadedBytes);

          tasks.value[index] = DownloadTask.merge(tasks.value[index], {
            downloadedBytes,
            speed,
            eta,
          });
        },
        controller.signal
      );

      // Mark as completed
      const finalIndex = tasks.value.findIndex((t) => t.id === taskId);
      if (finalIndex !== -1) {
        tasks.value[finalIndex] = DownloadTask.merge(tasks.value[finalIndex], {
          status: DownloadStatus.COMPLETED,
          downloadedBytes: tasks.value[finalIndex].file.size,
        });
      }
    } catch (error: any) {
      const index = tasks.value.findIndex((t) => t.id === taskId);
      if (index === -1) return;

      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        tasks.value[index] = DownloadTask.merge(tasks.value[index], {
          status: DownloadStatus.CANCELLED,
        });
      } else {
        tasks.value[index] = DownloadTask.merge(tasks.value[index], {
          status: DownloadStatus.FAILED,
          error: error.message,
        });
      }
    } finally {
      abortControllers.delete(taskId);
      progressTrackers.delete(taskId);
    }
  }

  function pauseTask(taskId: string) {
    const controller = abortControllers.get(taskId);
    if (controller) {
      controller.abort();
    }

    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = DownloadTask.merge(tasks.value[index], {
        status: DownloadStatus.PAUSED,
      });
    }
  }

  function resumeTask(taskId: string) {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = DownloadTask.merge(tasks.value[index], {
        status: DownloadStatus.PENDING,
      });
    }
  }

  function retryTask(taskId: string) {
    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = DownloadTask.merge(tasks.value[index], {
        status: DownloadStatus.PENDING,
        downloadedBytes: 0,
        error: undefined,
        signedUrl: undefined,
      });
    }
  }

  function cancelTask(taskId: string) {
    const controller = abortControllers.get(taskId);
    if (controller) {
      controller.abort();
    }

    const index = tasks.value.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      tasks.value[index] = DownloadTask.merge(tasks.value[index], {
        status: DownloadStatus.CANCELLED,
      });
    }
  }

  function removeTask(taskId: string) {
    const controller = abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      abortControllers.delete(taskId);
    }
    progressTrackers.delete(taskId);
    tasks.value = tasks.value.filter((t) => t.id !== taskId);
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter(
      (t) => t.status !== DownloadStatus.COMPLETED
    );
  }

  function clearAll() {
    abortControllers.forEach((controller) => controller.abort());
    abortControllers.clear();
    progressTrackers.clear();
    tasks.value = [];
  }

  function retryAll() {
    failedTasks.value.forEach((task) => retryTask(task.id));
  }

  const isCollapsed = ref(false);

  return {
    tasks,
    pendingTasks,
    downloadingTasks,
    completedTasks,
    failedTasks,
    totalProgress,
    averageSpeed,
    isCollapsed,
    addTask,
    addTasks,
    pauseTask,
    resumeTask,
    retryTask,
    cancelTask,
    removeTask,
    clearCompleted,
    retryAll,
    clearAll,
    toggleCollapse: () => {
      isCollapsed.value = !isCollapsed.value;
    },
    setSession: (s: SessionEntity) => {
      session.value = s;
    },
  };
});
