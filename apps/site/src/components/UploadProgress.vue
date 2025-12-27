<script setup lang="ts">
import { useUploadStore } from '@site/stores/upload';
import { UploadStatus } from '@site/models';
import { breakpointsTailwind } from '@vueuse/core';

const uploadStore = useUploadStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');

/**
 * State
 */
const uploadStoreRefs = storeToRefs(uploadStore);

/**
 * Computed
 */
const isVisible = computed(() => true); // 永遠顯示

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

function name(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] ?? '';
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
  uploadStore.pauseTask(taskId);
}

function handleResume(taskId: string) {
  uploadStore.resumeTask(taskId);
}

function handleCancel(taskId: string) {
  uploadStore.cancelTask(taskId);
}

function handleRetry(taskId: string) {
  uploadStore.retryTask(taskId);
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
      :class="[
        'fixed bg-white dark:bg-surface-900 shadow-2xl rounded-lg border border-surface-200 dark:border-surface-700 z-50',
        isMobile
          ? 'right-2 bottom-2 w-full max-w-[calc(100vw-1rem)]'
          : 'right-4 bottom-4 w-[600px] max-w-[calc(100vw-2rem)]',
      ]"
    >
      <!-- Header -->
      <div
        :class="[
          'flex items-center justify-between border-b border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800',
          isMobile ? 'p-3' : 'p-4',
        ]"
        @click="handleToggleCollapse"
      >
        <div
          :class="[
            'flex items-center min-w-0 flex-1',
            isMobile ? 'gap-2' : 'gap-3',
          ]"
        >
          <i
            :class="[
              'pi pi-cloud-upload text-primary-500 flex-shrink-0',
              isMobile ? 'text-lg' : 'text-xl',
            ]"
          />
          <div class="min-w-0 flex-1">
            <h3
              :class="[
                'font-semibold text-surface-900 dark:text-surface-0',
                isMobile ? 'text-sm' : 'text-base',
              ]"
            >
              上傳任務
            </h3>
            <p class="text-xs text-surface-500 truncate">
              <template v-if="uploadStoreRefs.activeTasks.value.length > 0">
                {{ uploadStoreRefs.activeTasks.value.length }} 個進行中
                <span v-if="uploadStoreRefs.completedTasks.value.length > 0">
                  · {{ uploadStoreRefs.completedTasks.value.length }} 個已完成
                </span>
              </template>
              <template
                v-else-if="uploadStoreRefs.completedTasks.value.length > 0"
              >
                {{ uploadStoreRefs.completedTasks.value.length }} 個已完成
              </template>
              <template v-else> 目前沒有上傳任務 </template>
            </p>
          </div>
        </div>

        <div
          :class="[
            'flex items-center flex-shrink-0',
            isMobile ? 'gap-1' : 'gap-2',
          ]"
        >
          <!-- Overall Progress -->
          <div
            :class="[
              'font-medium text-primary-600 dark:text-primary-400',
              isMobile ? 'text-xs' : 'text-sm',
            ]"
          >
            {{ uploadStoreRefs.totalProgress.value }}%
          </div>

          <!-- Clear Completed Button -->
          <Button
            v-if="!isMobile && uploadStoreRefs.completedTasks.value.length > 0"
            icon="pi pi-trash"
            severity="secondary"
            variant="text"
            size="small"
            title="清除已完成"
            @click.stop="handleClearCompleted"
          />

          <!-- Collapse/Expand Icon -->
          <i
            :class="[
              'pi transition-transform',
              isMobile ? 'text-base' : 'text-lg',
              uploadStoreRefs.isCollapsed.value
                ? 'pi-chevron-up'
                : 'pi-chevron-down',
            ]"
          />
        </div>
      </div>
      <div
        v-if="!uploadStoreRefs.isCollapsed.value"
        :class="['overflow-y-auto', isMobile ? 'max-h-[70vh]' : 'max-h-96']"
      >
        <div
          v-for="task in uploadStoreRefs.tasks.value"
          :key="task.id"
          :class="[
            'border-b border-surface-200 dark:border-surface-700 last:border-b-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors',
            isMobile ? 'px-3 py-2' : 'px-4 py-2.5',
          ]"
        >
          <div :class="['flex items-center', isMobile ? 'gap-2' : 'gap-3']">
            <!-- Status Icon -->
            <i
              :class="[
                getStatusIcon(task.status),
                getStatusColor(task.status),
                'flex-shrink-0',
                isMobile ? 'text-base' : 'text-lg',
              ]"
            />

            <!-- File Info & Progress -->
            <div class="flex-1 min-w-0 flex items-center gap-2">
              <!-- File Name & Size -->
              <div class="min-w-0 flex-shrink">
                <p
                  :class="[
                    'font-medium text-surface-900 dark:text-surface-0 truncate leading-tight',
                    isMobile ? 'text-xs' : 'text-sm',
                  ]"
                >
                  {{ name(task.path) }}
                </p>
                <div
                  class="flex items-center gap-2 text-xs text-surface-500 mt-0.5"
                >
                  <span :class="getStatusColor(task.status)">
                    {{ getStatusLabel(task.status) }}
                  </span>
                  <span>{{ formatFileSize(task.file.size) }}</span>
                  <!-- Speed & ETA (only for uploading tasks on desktop) -->
                  <template
                    v-if="!isMobile && task.status === UploadStatus.UPLOADING"
                  >
                    <template v-if="uploadStore.getProgress(task.id)">
                      <span>
                        ·
                        {{
                          formatSpeed(
                            uploadStore.getProgress(task.id)?.speed ?? 0
                          )
                        }}
                      </span>
                      <span
                        v-if="
                          (uploadStore.getProgress(task.id)
                            ?.estimatedTimeRemaining ?? 0) > 0
                        "
                      >
                        ·
                        {{
                          formatTime(
                            uploadStore.getProgress(task.id)
                              ?.estimatedTimeRemaining ?? 0
                          )
                        }}
                      </span>
                    </template>
                  </template>
                  <!-- Error Message -->
                  <span
                    v-if="task.error"
                    class="text-red-500 truncate"
                    :title="task.error"
                  >
                    · {{ task.error }}
                  </span>
                </div>
              </div>

              <!-- Progress Bar (inline, flexible width on desktop) -->
              <div
                v-if="
                  !isMobile &&
                  task.status !== UploadStatus.COMPLETED &&
                  task.status !== UploadStatus.CANCELLED
                "
                class="flex-1"
              >
                <ProgressBar
                  :value="getProgress(task.id)"
                  :show-value="false"
                  class="h-1.5"
                />
              </div>

              <!-- Progress Percentage -->
              <div
                v-if="
                  task.status !== UploadStatus.COMPLETED &&
                  task.status !== UploadStatus.CANCELLED
                "
                class="text-xs font-medium text-surface-600 dark:text-surface-400 flex-shrink-0 w-10 text-right"
              >
                {{ getProgress(task.id) }}%
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-0.5 flex-shrink-0">
              <!-- Priority Controls (only for pending tasks, hidden on mobile) -->
              <template
                v-if="!isMobile && task.status === UploadStatus.PENDING"
              >
                <Button
                  icon="pi pi-angle-up"
                  severity="secondary"
                  variant="text"
                  size="small"
                  :disabled="uploadStoreRefs.tasks.value.indexOf(task) === 0"
                  title="提高優先序"
                  @click="uploadStore.increasePriority(task.id)"
                />
                <Button
                  icon="pi pi-angle-down"
                  severity="secondary"
                  variant="text"
                  size="small"
                  :disabled="
                    uploadStoreRefs.tasks.value.indexOf(task) ===
                    uploadStoreRefs.tasks.value.length - 1
                  "
                  title="降低優先序"
                  @click="uploadStore.decreasePriority(task.id)"
                />
              </template>

              <!-- Pause/Resume -->
              <Button
                v-if="task.status === UploadStatus.UPLOADING"
                icon="pi pi-pause"
                severity="secondary"
                variant="text"
                size="small"
                title="暫停"
                @click="handlePause(task.id)"
              />
              <Button
                v-else-if="task.status === UploadStatus.PAUSED"
                icon="pi pi-play"
                severity="secondary"
                variant="text"
                size="small"
                title="繼續"
                @click="handleResume(task.id)"
              />

              <!-- Retry -->
              <Button
                v-if="
                  task.status === UploadStatus.FAILED ||
                  task.status === UploadStatus.EXPIRED ||
                  task.status === UploadStatus.VERIFICATION_FAILED
                "
                icon="pi pi-refresh"
                severity="secondary"
                variant="text"
                size="small"
                title="重試"
                @click="handleRetry(task.id)"
              />

              <!-- Cancel -->
              <Button
                v-if="
                  task.status !== UploadStatus.COMPLETED &&
                  task.status !== UploadStatus.CANCELLED &&
                  task.status !== UploadStatus.FAILED
                "
                icon="pi pi-times"
                severity="secondary"
                variant="text"
                size="small"
                title="取消"
                @click="handleCancel(task.id)"
              />

              <!-- Remove -->
              <Button
                v-if="
                  task.status === UploadStatus.COMPLETED ||
                  task.status === UploadStatus.CANCELLED ||
                  task.status === UploadStatus.FAILED
                "
                icon="pi pi-trash"
                severity="secondary"
                variant="text"
                size="small"
                title="移除"
                @click="handleRemove(task.id)"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="uploadStoreRefs.tasks.value.length === 0"
          :class="['text-center text-surface-500', isMobile ? 'p-6' : 'p-8']"
        >
          <i
            :class="['pi pi-inbox mb-2', isMobile ? 'text-3xl' : 'text-4xl']"
          />
          <p class="text-sm">目前沒有上傳任務</p>
        </div>
      </div>
    </div>
  </Transition>
</template>
