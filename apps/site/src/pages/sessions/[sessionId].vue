<script setup lang="ts">
import { INJECT_KEYS } from '@site/services';
import { SessionService } from '@site/services/session';
import { useAsyncState } from '@vueuse/core';
import { useRoute } from 'vue-router';

const sessionService = inject<SessionService>(INJECT_KEYS.SessionService)!;

const route = useRoute();
const sessionId = computed(() => route.params.sessionId as string);

const { state: session, isLoading, execute: fetch } = useAsyncState(
  async (id: string) => {
    if (!id) return undefined;
    return await sessionService.get(id);
  },
  null,
  { immediate: false }
);

watch(
  sessionId,
  (newId) => {
    if (newId) {
      fetch(0, newId);
    }
  },
  { immediate: true }
);

provide('session', session);
</script>

<template>
  <TheAppLayout>
    <template #sidebar>
      <ExplorerBar v-if="!isLoading" :session="session!" />
    </template>
    <template #content>
      <RouterView />
    </template>
  </TheAppLayout>
  <AppDialog />
</template>
