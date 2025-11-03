<script setup lang="ts">
import { mockFiles } from '@site/models';

const openSettings = ref(false);
</script>

<template>
  <div class="mx-4 mt-4">
    <Breadcrumb
      :path="'yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy'"
    />
    <div class="mt-2 mb-3 gap-1 flex justify-between items-center">
      <div class="gap-1 flex items-center">
        <!-- title and dropdown menu -->
        <Hover className="gap-1 p-1 flex items-center">
          <span class="text-xl font-bold break-all">
            ContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContentsContents
            Layout
          </span>
          <Hover variant="link">
            <SvgIcon name="angle-down" :class-name="['size-5']" />
          </Hover>
        </Hover>

        <!-- copy button -->
        <Hover class-name="mx-2">
          <SvgIcon name="copy" :class-name="['size-5']" />
        </Hover>
      </div>
      <div>
        <Button @click="openSettings = true" icon-name="view-setting" />
      </div>
    </div>
  </div>

  <div class="flex-1 px-4">
    <FileList :files="mockFiles()" />
  </div>
</template>
