<script setup lang="ts">
import NavigationButton from "./NavigationButton.vue";

defineProps<{
  currentView: string;
  changeView: (view: string) => void;
}>();
</script>

<template lang="pug">
.nav-bar
  NavigationButton(icon="home", label="主頁", value="home",:current-view="currentView", :change-view="changeView")
  NavigationButton(icon="earthquake", label="地震報告", value="report-list",:current-view="currentView", :change-view="changeView")
  NavigationButton(icon="settings", label="設定", value="config", :current-view="currentView", :change-view="changeView")
</template>

<style>
.nav-bar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 9999999;
}
</style>
