<script setup lang="ts">
import { useSessionStore } from '@site/stores/session';

definePage({
  redirect: (to) => {
    const sessionStore = useSessionStore();
    const session = sessionStore.get((to.params as any).sessionId);
    const mount = session?.mount || '';
    return { path: `/sessions/${(to.params as any).sessionId}/mount/${mount}` };
  },
});
</script>
<template></template>
