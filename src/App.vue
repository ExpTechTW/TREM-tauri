<script setup lang="ts">
import ConfirmDialog from "primevue/confirmdialog";
import FileDropOverlayView from "./view/FileDropOverlayView.vue";
import Toast from "primevue/toast";
import Titlebar from "./components/window/Titlebar.vue";

import { onMounted, onUnmounted, ref } from "vue";
import { getCurrent } from "@tauri-apps/api/window";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const win = getCurrent();

const isFileDropOverlayVisible = ref(false);
const replayFilePath = ref("");

const uFileDrop = win.onDragDropEvent((event) => {
  if (route.path == "/replay") return;

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

const preventContextMenu = (e: MouseEvent) => {
  if (e.bubbles) {
    e.preventDefault();
  }
};

onMounted(() => {
  document.addEventListener("contextmenu", preventContextMenu);
});

onUnmounted(() => {
  uFileDrop.then((f) => f());
  document.removeEventListener("contextmenu", preventContextMenu);
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
