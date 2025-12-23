<script setup lang="ts">
import { useUploadStore } from '@site/stores/upload';
import { UploadStatus } from '@site/models';
import { UploadManager } from '@site/services/upload-manager';

const uploadStore = useUploadStore();
const uploadManager = UploadManager.getInstance();

/**
 * State
 */
const uploadStoreRefs = storeToRefs(uploadStore);

/**
 * Computed
 */
const isVisible = computed(() => uploadStoreRefs.activeTasks.value.length > 0);

/**
 * Helpers
 */
function getStatusIcon(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.PENDING:
      return 'pi pi-clock';
    case UploadStatus.CALCULATING:
      return 'pi pi-spin pi-spinner';
    case UploadStatus.UPLOADING:
      return 'pi pi-spin pi-spinner';
    case UploadStatus.PAUSED:
      return 'pi pi-pause';
    case UploadStatus.COMPLETED:
      return 'pi pi-check-circle';
    case UploadStatus.FAILED:
      return 'pi pi-times-circle';
    case UploadStatus.EXPIRED:
      return 'pi pi-exclamation-circle';
    case UploadStatus.VERIFICATION_FAILED:
      return 'pi pi-exclamation-triangle';
    case UploadStatus.CANCELLED:
      return 'pi pi-ban';
    default:
      return 'pi pi-file';
  }
}

function getStatusColor(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.PENDING:
      return 'text-gray-500';
    case UploadStatus.CALCULATING:
      return 'text-blue-500';
    case UploadStatus.UPLOADING:
      return 'text-blue-500';
    case UploadStatus.PAUSED:
      return 'text-orange-500';
    case UploadStatus.COMPLETED:
      return 'text-green-500';
    case UploadStatus.FAILED:
      return 'text-red-500';
    case UploadStatus.EXPIRED:
      return 'text-orange-500';
    case UploadStatus.VERIFICATION_FAILED:
      return 'text-red-500';
    case UploadStatus.CANCELLED:
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}

function getStatusLabel(status: UploadStatus): string {
  switch (status) {
    case UploadStatus.PENDING:
      return '等待中';
    case UploadStatus.CALCULATING:
      return '計算中';
    case UploadStatus.UPLOADING:
      return '上傳中';
    case UploadStatus.PAUSED:
      return '已暫停';
    case UploadStatus.COMPLETED:
      return '已完成';
    case UploadStatus.FAILED:
      return '失敗';
    case UploadStatus.EXPIRED:
      return '已過期';
    case UploadStatus.VERIFICATION_FAILED:
      return '驗證失敗';
    case UploadStatus.CANCELLED:
      return '已取消';
    default:
      return status;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatSpeed(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}分鐘`;
  } else {
    return `${Math.round(seconds / 3600)}小時`;
  }
}

function getProgress(taskId: string): number {
  const task = uploadStoreRefs.tasks.value.find((t) => t.id === taskId);
  if (!task) return 0;

  if (task.status === UploadStatus.COMPLETED) return 100;
  if (task.file.size === 0) return 0;

  return Math.round((task.uploadedBytes / task.file.size) * 100);
}

/**
 * Actions
 */
function handlePause(taskId: string) {
  uploadManager.pauseUpload(taskId);
}

function handleResume(taskId: string) {
  uploadManager.resumeUpload(taskId);
}

function handleCancel(taskId: string) {
  uploadManager.cancelUpload(taskId);
}

function handleRemove(taskId: string) {
  uploadStore.removeTask(taskId);
}

function handleClearCompleted() {
  uploadStore.clearCompletedTasks();
}

function handleToggleCollapse() {
  uploadStore.toggleCollapse();
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed right-4 bottom-4 w-[600px] max-w-[calc(100vw-2rem)] bg-white dark:bg-surface-900 shadow-2xl rounded-lg border border-surface-200 dark:border-surface-700 z-50"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800"
        @click="handleToggleCollapse"
      >
        <div class="flex items-center gap-3">
          <i class="pi pi-cloud-upload text-xl text-primary-500"></i>
          <div>
            <h3 class="font-semibold text-surface-900 dark:text-surface-0">
              上傳任務
            </h3>
            <p class="text-xs text-surface-500">
              {{ uploadStoreRefs.activeTasks.value.length }} 個進行中
              <span v-if="uploadStoreRefs.completedTasks.value.length > 0">
                · {{ uploadStoreRefs.completedTasks.value.length }} 個已完成
              </span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Overall Progress -->
          <div class="text-sm font-medium text-primary-600 dark:text-primary-400">
            {{ uploadStoreRefs.totalProgress.value }}%
          </div>

          <!-- Clear Completed Button -->
          <Button
            v-if="uploadStoreRefs.completedTasks.value.length > 0"
            icon="pi pi-trash"
            severity="secondary"
            variant="text"
            size="small"
            @click.stop="handleClearCompleted"
          />

          <!-- Collapse/Expand Icon -->
          <i
            :class="[
              'pi transition-transform',
              uploadStoreRefs.isCollapsed.value ? 'pi-chevron-up' : 'pi-chevron-down',
            ]"
          ></i>
        </div>
      </div>

      <!-- Task List -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div
          v-if="!uploadStoreRefs.isCollapsed.value"
          class="max-h-96 overflow-y-auto"
        >
          <div
            v-for="task in uploadStoreRefs.tasks.value"
            :key="task.id"
            class="p-4 border-b border-surface-200 dark:border-surface-700 last:border-b-0"
          >
            <div class="flex items-start gap-3">
              <!-- Status Icon -->
              <i
                :class="[
                  getStatusIcon(task.status),
                  getStatusColor(task.status),
                  'text-xl mt-1',
                ]"
              ></i>

              <!-- File Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-900 dark:text-surface-0 truncate">
                      {{ task.readableName }}
                    </p>
                    <p class="text-xs text-surface-500">
                      {{ formatFileSize(task.file.size) }}
                      <span v-if="task.status === UploadStatus.UPLOADING">
                        · {{ formatFileSize(task.uploadedBytes) }}
                      </span>
                    </p>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-1">
                    <!-- Pause/Resume -->
                    <Button
                      v-if="task.status === UploadStatus.UPLOADING"
                      icon="pi pi-pause"
                      severity="secondary"
                      variant="text"
                      size="small"
                      @click="handlePause(task.id)"
                    />
                    <Button
                      v-else-if="task.status === UploadStatus.PAUSED || task.status === UploadStatus.PENDING"
                      icon="pi pi-play"
                      severity="secondary"
                      variant="text"
                      size="small"
                      @click="handleResume(task.id)"
                    />

                    <!-- Cancel -->
                    <Button
                      v-if="task.status !== UploadStatus.COMPLETED && task.status !== UploadStatus.CANCELLED"
                      icon="pi pi-times"
                      severity="secondary"
                      variant="text"
                      size="small"
                      @click="handleCancel(task.id)"
                    />

                    <!-- Remove -->
                    <Button
                      v-if="task.status === UploadStatus.COMPLETED || task.status === UploadStatus.CANCELLED"
                      icon="pi pi-trash"
                      severity="secondary"
                      variant="text"
                      size="small"
                      @click="handleRemove(task.id)"
                    />
                  </div>
                </div>

                <!-- Progress Bar -->
                <div v-if="task.status !== UploadStatus.COMPLETED && task.status !== UploadStatus.CANCELLED" class="mb-2">
                  <ProgressBar
                    :value="getProgress(task.id)"
                    :show-value="false"
                    class="h-2"
                  />
                </div>

                <!-- Status & Speed Info -->
                <div class="flex items-center justify-between text-xs">
                  <span :class="getStatusColor(task.status)">
                    {{ getStatusLabel(task.status) }}
                  </span>

                  <!-- Speed & ETA (only for uploading tasks) -->
                  <span
                    v-if="task.status === UploadStatus.UPLOADING"
                    class="text-surface-500"
                  >
                    <!-- TODO: 從 UploadManager 獲取速度和預估時間 -->
                    上傳中...
                  </span>

                  <!-- Error Message -->
                  <span
                    v-if="task.error"
                    class="text-red-500 truncate max-w-xs"
                    :title="task.error"
                  >
                    {{ task.error }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="uploadStoreRefs.tasks.value.length === 0"
            class="p-8 text-center text-surface-500"
          >
            <i class="pi pi-inbox text-4xl mb-2"></i>
            <p>目前沒有上傳任務</p>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
