<script setup lang="ts">
import MaterialSymbols from "../misc/MaterialSymbols.vue";

import { getCurrent } from "@tauri-apps/api/webviewWindow";

const webview = getCurrent();

const props = defineProps<{
  type: "minimize" | "maximize" | "restore" | "close";
}>();

const action = () => {
  switch (props.type) {
    case "minimize":
      webview.minimize();
      break;

    case "maximize":
      webview.maximize();
      break;

    case "restore":
      webview.unmaximize();
      break;

    case "close":
      webview.close();
      break;
  }
};
</script>

<template>
  <div
    v-tooltip.bottom="{ value: type, showDelay: 1000 }"
    class="window-control-button"
    :class="[type]"
    @click="action"
  >
    <MaterialSymbols v-if="type == 'minimize'" :icon="'\ue931'" :size="22" />
    <MaterialSymbols v-if="type == 'restore'" :icon="'\ue6fa'" :size="18" />
    <MaterialSymbols v-if="type == 'maximize'" :icon="'\ue3c6'" :size="16" />
    <MaterialSymbols v-if="type == 'close'" :icon="'\ue5cd'" :size="22" />
  </div>
</template>

<style scoped>
.window-control-button {
  display: grid;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 100%;
  cursor: pointer;
  transition: background-color 0.1s ease-in-out;
}

.window-control-button:hover {
  background-color: color-mix(in lab, transparent, var(--p-surface-50) 8%);
}

.close:hover {
  background-color: var(--p-red-600);
}
</style>
