<script setup lang="ts">
definePage({
  redirect: (to) => {
    return { path: `/sessions/${(to.params as any).sessionId}/mount/` };
  },
});
</script>
<template></template>
