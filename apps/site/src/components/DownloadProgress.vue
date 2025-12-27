<script setup lang="ts">
import { useDownloadStore } from '@site/stores/download';
import { DownloadStatus, DownloadTask } from '@site/models/DownloadTask';
import { breakpointsTailwind } from '@vueuse/core';

const {
  failedTasks,
  downloadingTasks,
  completedTasks,
  totalProgress,
  isCollapsed,
  tasks,
  isMobile,
} = defineProps<{
  failedTasks: DownloadTask[];
  downloadingTasks: DownloadTask[];
  completedTasks: DownloadTask[];
  totalProgress: number;
  isCollapsed: boolean;
  tasks: DownloadTask[];
  isMobile: boolean;
}>();

const emit = defineEmits<{
  (e: 'pause', taskId: string): void;
  (e: 'resume', taskId: string): void;
  (e: 'retry', taskId: string): void;
  (e: 'remove', taskId: string): void;
  (e: 'clearCompleted'): void;
  (e: 'retryAll'): void;
  (e: 'toggleCollapse'): void;
}>();

/**
 * Helpers
 */
function getStatusIcon(status: DownloadStatus): string {
  switch (status) {
    case DownloadStatus.PENDING:
      return 'pi pi-clock';
    case DownloadStatus.FETCHING_URL:
      return 'pi pi-spin pi-spinner';
    case DownloadStatus.DOWNLOADING:
      return 'pi pi-spin pi-spinner';
    case DownloadStatus.PAUSED:
      return 'pi pi-pause';
    case DownloadStatus.COMPLETED:
      return 'pi pi-check-circle';
    case DownloadStatus.FAILED:
      return 'pi pi-times-circle';
    case DownloadStatus.EXPIRED:
      return 'pi pi-exclamation-circle';
    case DownloadStatus.CANCELLED:
      return 'pi pi-ban';
    default:
      return 'pi pi-file';
  }
}

function getStatusColor(status: DownloadStatus): string {
  switch (status) {
    case DownloadStatus.PENDING:
      return 'text-gray-500';
    case DownloadStatus.FETCHING_URL:
      return 'text-blue-500';
    case DownloadStatus.DOWNLOADING:
      return 'text-blue-500';
    case DownloadStatus.PAUSED:
      return 'text-orange-500';
    case DownloadStatus.COMPLETED:
      return 'text-green-500';
    case DownloadStatus.FAILED:
      return 'text-red-500';
    case DownloadStatus.EXPIRED:
      return 'text-orange-500';
    case DownloadStatus.CANCELLED:
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}

function getStatusLabel(status: DownloadStatus): string {
  switch (status) {
    case DownloadStatus.PENDING:
      return '等待中';
    case DownloadStatus.FETCHING_URL:
      return '取得下載網址';
    case DownloadStatus.DOWNLOADING:
      return '下載中';
    case DownloadStatus.PAUSED:
      return '已暫停';
    case DownloadStatus.COMPLETED:
      return '已完成';
    case DownloadStatus.FAILED:
      return '失敗';
    case DownloadStatus.EXPIRED:
      return '已過期';
    case DownloadStatus.CANCELLED:
      return '已取消';
    default:
      return status;
  }
}

function formatFileSize(bytes: number): string {
  // 確保 bytes 是數字
  const numBytes = typeof bytes === 'number' ? bytes : Number(bytes) || 0;
  if (numBytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = numBytes;
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

function getProgress(task: any): number {
  if (task.status === DownloadStatus.COMPLETED) return 100;
  if (task.file.size === 0) return 0;

  return Math.round((task.downloadedBytes / task.file.size) * 100);
}
</script>

<template>
  <!-- Header -->
  <div
    :class="[
      'flex items-center justify-between border-b border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800',
      isMobile ? 'p-3' : 'p-4',
    ]"
    @click="emit('toggleCollapse')"
  >
    <div
      :class="[
        'flex items-center min-w-0 flex-1',
        isMobile ? 'gap-2' : 'gap-3',
      ]"
    >
      <i
        :class="[
          'pi pi-download text-blue-500 flex-shrink-0',
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
          下載任務
        </h3>
        <p class="text-xs text-surface-500 truncate">
          <template v-if="!isEmpty(downloadingTasks)">
            {{ downloadingTasks.length }} 個進行中
            <span v-if="!isEmpty(completedTasks)">
              · {{ completedTasks.length }} 個已完成
            </span>
          </template>
          <template v-else-if="!isEmpty(completedTasks)">
            {{ completedTasks.length }} 個已完成
          </template>
          <template v-else> 目前沒有下載任務 </template>
        </p>
      </div>
    </div>

    <div
      :class="['flex items-center flex-shrink-0', isMobile ? 'gap-1' : 'gap-2']"
    >
      <!-- Overall Progress -->
      <div
        :class="[
          'font-medium text-blue-600 dark:text-blue-400',
          isMobile ? 'text-xs' : 'text-sm',
        ]"
      >
        {{ Math.round(totalProgress) }}%
      </div>

      <!-- Retry All Button -->
      <button
        v-if="!isMobile && failedTasks.length > 0"
        class="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors"
        title="全部重試"
        @click.stop="emit('retryAll')"
      >
        <i
          class="pi pi-refresh text-sm text-surface-600 dark:text-surface-400"
        />
      </button>

      <!-- Clear Completed Button -->
      <button
        v-if="!isMobile && completedTasks.length > 0"
        class="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded transition-colors"
        title="清除已完成"
        @click.stop="emit('clearCompleted')"
      >
        <SvgIcon
          name="broom"
          class="w-4 h-4 text-surface-600 dark:text-surface-400"
        />
      </button>

      <!-- Collapse/Expand Icon -->
      <i
        :class="[
          'pi transition-transform',
          isMobile ? 'text-base' : 'text-lg',
          isCollapsed ? 'pi-chevron-up' : 'pi-chevron-down',
        ]"
      />
    </div>
  </div>

  <!-- Task List -->
  <div
    v-if="!isCollapsed"
    :class="['overflow-y-auto', isMobile ? 'max-h-[70vh]' : 'max-h-96']"
  >
    <div
      v-for="task in tasks"
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
              {{ task.file.relativePath }}
            </p>
            <div
              class="flex items-center gap-2 text-xs text-surface-500 mt-0.5"
            >
              <span :class="getStatusColor(task.status)">
                {{ getStatusLabel(task.status) }}
              </span>
              <span>{{ formatFileSize(task.file.size) }}</span>
              <!-- Speed & ETA (only for downloading tasks on desktop) -->
              <template
                v-if="!isMobile && task.status === DownloadStatus.DOWNLOADING"
              >
                <span v-if="task.speed"> · {{ formatSpeed(task.speed) }} </span>
                <span v-if="task.eta && task.eta > 0">
                  · {{ formatTime(task.eta) }}
                </span>
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
              task.status !== DownloadStatus.COMPLETED &&
              task.status !== DownloadStatus.CANCELLED
            "
            class="flex-1"
          >
            <ProgressBar
              :value="getProgress(task)"
              :show-value="false"
              class="h-1.5"
            />
          </div>

          <!-- Progress Percentage -->
          <div
            v-if="
              task.status !== DownloadStatus.COMPLETED &&
              task.status !== DownloadStatus.CANCELLED
            "
            class="text-xs font-medium text-surface-600 dark:text-surface-400 flex-shrink-0 w-10 text-right"
          >
            {{ getProgress(task) }}%
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-0.5 flex-shrink-0">
          <!-- Pause/Resume -->
          <Button
            v-if="task.status === DownloadStatus.DOWNLOADING"
            icon="pi pi-pause"
            severity="secondary"
            variant="text"
            size="small"
            title="暫停"
            @click="emit('pause', task.id)"
          />
          <Button
            v-else-if="task.status === DownloadStatus.PAUSED"
            icon="pi pi-play"
            severity="secondary"
            variant="text"
            size="small"
            title="繼續"
            @click="emit('resume', task.id)"
          />

          <!-- Retry -->
          <Button
            v-if="
              task.status === DownloadStatus.FAILED ||
              task.status === DownloadStatus.EXPIRED
            "
            icon="pi pi-refresh"
            severity="secondary"
            variant="text"
            size="small"
            title="重試"
            @click="emit('retry', task.id)"
          />

          <!-- Remove -->
          <Button
            v-if="
              task.status === DownloadStatus.COMPLETED ||
              task.status === DownloadStatus.CANCELLED ||
              task.status === DownloadStatus.FAILED
            "
            icon="pi pi-trash"
            severity="secondary"
            variant="text"
            size="small"
            title="移除"
            @click="emit('remove', task.id)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="isEmpty(tasks)"
      :class="['text-surface-500', isMobile ? 'px-3 py-2' : 'px-4 py-2.5']"
    >
      <div :class="['flex items-center', isMobile ? 'gap-2' : 'gap-3']">
        <i :class="['pi', 'pi-inbox', isMobile ? 'text-3xl' : 'text-4xl']" />
        <span class="text-sm">目前沒有下載任務</span>
        <div class="h-[32px] w-[35px]" />
      </div>
    </div>
  </div>
</template>
