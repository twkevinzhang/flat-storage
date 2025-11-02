<script setup lang="ts">
import { mockFiles } from "@site/models"
</script>

<template>
  <DesktopLayout>
    <template v-slot:sidebar>
      <ExplorerBar :entities="mockFiles()" />
    </template>
    <template v-slot:content>
      <Breadcrumb
        :path="'yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy/yyyyyyyyyyyyyyy'"
      />
      <Contents />
    </template>
  </DesktopLayout>
</template>
