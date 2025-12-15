<script setup lang="ts"></script>

<template>
  <ul>
    <ObjectTree
      v-for="obj in parents"
      :key="obj.path"
      :node="obj"
      :children-map="childrenMap"
      @click="handleItemClick"
      @load-children="handleLoadChildren"
    />
  </ul>
</template>
