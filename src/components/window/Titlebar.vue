<script setup lang="ts">
import WindowControlButton from "./WindowControlButton.vue";
import { version } from "../../../package.json";
import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { onUnmounted, ref } from "vue";

const webview = getCurrent();

const isMaximized = ref(false);

const unlisten = webview.listen("tauri://resize", async () => {
  isMaximized.value = await webview.isMaximized();
});

onUnmounted(() => {
  unlisten.then((f) => f());
});
</script>

<template>
  <div data-tauri-drag-region id="titlebar">
    <div class="titlebar-title">
      <div class="window-icon">
        <img src="/app.ico" class="window-icon" />
      </div>
      <div class="window-title">
        <span class="app-name">TREM Tauri</span>
        <span class="app-version">v{{ version }}</span>
      </div>
    </div>
    <div class="titlebar-action">
      <WindowControlButton type="minimize" />
      <WindowControlButton :type="isMaximized ? 'restore' : 'maximize'" />
      <WindowControlButton type="close" />
    </div>
  </div>
</template>

<style scoped>
#titlebar {
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 16px;
  width: 100svw;
  height: 32px;
  white-space: nowrap;
}

.titlebar-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.titlebar-action {
  display: grid;
  grid-auto-flow: column;
  height: 100%;
}

.window-icon {
  height: 20px;
  width: 20px;
}

.window-title {
  display: flex;
  gap: 8px;
}

.app-version {
  opacity: 0.6;
  font-size: smaller;
}
</style>
