<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import FileDropOverlayView from "./view/FileDropOverlayView.vue";
import Toast from "primevue/toast";
import Titlebar from "./components/window/Titlebar.vue";

import { onUnmounted, ref } from "vue";

import { getCurrent } from "@tauri-apps/api/webview";

const win = getCurrent();

const isFileDropOverlayVisible = ref(false);

const uFileDrop = win.onFileDropEvent((event) => {
  if (event.payload.type === "hover") {
    console.log("User hovering", event.payload.paths);
  } else if (event.payload.type === "drop") {
    console.log("User dropped", event.payload.paths);
  } else {
    console.log("File drop cancelled");
  }
});

onUnmounted(() => {
  uFileDrop.then((f) => f());
});
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
  <FileDropOverlayView :isVisible="isFileDropOverlayVisible" />
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
