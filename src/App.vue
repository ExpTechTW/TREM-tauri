<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import Titlebar from "./components/window/Titlebar.vue";
</script>

<template>
  <Titlebar />
  <router-view v-slot="{ Component }">
    <transition name="fade">
      <component :is="Component" />
    </transition>
  </router-view>
  <ConfirmDialog />
  <Toast />
</template>

<style>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  width: 6px;
  border-radius: 8px;
  background-color: var(--p-surface-600);
}
</style>
