<script setup lang="ts">
import { EntityPath } from '@site/models';

definePage({
  redirect: (to) => {
    const path = EntityPath.fromRoute({
      sessionId: (to.params as any).sessionId,
      mount: '/',
    });
    return { path: path.toRoute() + '/' };
  },
});
</script>
<template></template>
