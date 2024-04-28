<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import FileDropOverlayView from "./view/FileDropOverlayView.vue";
import Toast from "primevue/toast";
import Titlebar from "./components/window/Titlebar.vue";

import { onUnmounted, ref } from "vue";
import { getCurrent } from "@tauri-apps/api/window";
import { useRouter } from "vue-router";

const router = useRouter();
const win = getCurrent();

const isFileDropOverlayVisible = ref(false);
const replayFilePath = ref("");

const uFileDrop = win.onDragDropEvent((event) => {
  if (event.payload.type === "dragged") {
    const files = event.payload.paths.filter((v) => v.endsWith(".trply"));

    if (files.length) {
      isFileDropOverlayVisible.value = true;
      replayFilePath.value = files[0];
    }
  } else if (event.payload.type === "dropped") {
    const files = event.payload.paths.filter((v) => v.endsWith(".trply"));

    isFileDropOverlayVisible.value = false;
    replayFilePath.value = "";

    router.push({
      path: "/replay",
      query: {
        path: files[0],
      },
    });
  } else if (event.payload.type === "cancelled") {
    isFileDropOverlayVisible.value = false;
    replayFilePath.value = "";
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
  <FileDropOverlayView
    :path="replayFilePath"
    :isVisible="isFileDropOverlayVisible"
  />
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
