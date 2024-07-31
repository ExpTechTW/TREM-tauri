<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import Global from "@/global";

const route = useRoute();

const isNavigationRailExpanded = computed(() => route.path == "/");

onMounted(() => {
  Global.init();
});
</script>

<template>
  <main>index</main>
</template>

<style>
#main {
  position: relative;
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 8px;
  padding: 8px;
  min-height: 0;
}

.navigation {
  display: flex;
  min-height: 0;
}

.content {
  position: relative;
  background-color: var(--t-surface-color);
  border-radius: 8px;
  overflow: hidden;
}

body.win11 .content {
  background-color: color-mix(in srgb, transparent, var(--p-surface-0) 60%);
  outline: 1px solid var(--p-surface-200);
}

.stack {
  display: grid;
  position: absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
}
/*
.left-enter-active,
.left-leave-active {
  transition: max-width 0.4s ease, opacity 0.4s ease;
}

.left-enter-to,
.left-leave-from {
  max-width: 500px;
}

.left-enter-from,
.left-leave-to {
  max-width: 0;
  opacity: 0;
}
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-color-scheme: dark) {
  body.win11 .content {
    background-color: color-mix(in srgb, transparent, var(--p-surface-100) 5%);
    outline: none;
  }
}
</style>
