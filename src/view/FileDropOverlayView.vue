<script setup lang="ts">
import MaterialSymbols from "@/components/misc/MaterialSymbols.vue";
import { computed } from "vue";

const props = defineProps<{
  path: string;
  isVisible: boolean;
}>();

const filename = computed(() => props.path.split(/(\\|\/)/g).pop());
</script>

<template>
  <div class="file-drop-overlay" :class="{ show: isVisible }">
    <div class="file-drop-container">
      <div class="icon"><MaterialSymbols icon="file_open" :size="48" /></div>
      <div class="title">
        重播 <span class="filename">{{ filename }}</span>
      </div>
      <div class="description">準備好重播了嗎？請將檔案放到這裡！</div>
    </div>
  </div>
</template>

<style scoped>
.file-drop-overlay {
  display: grid;
  position: fixed;
  inset: 0;
  padding: 24px;
  opacity: 0;
  background-color: color-mix(in srgb, transparent, var(--p-surface-900) 60%);
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 9999999;
}

.file-drop-overlay.show {
  pointer-events: all;
  opacity: 1;
}

.file-drop-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  width: 100%;
  border-radius: 16px;
  border: 4px dashed var(--p-primary-color);
  background-color: color-mix(in srgb, transparent, var(--p-surface-800) 90%);
}

.title {
  font-size: 26px;
}

.description {
  font-size: 16px;
  opacity: 0.8;
}

.filename {
  color: var(--p-primary-color);
}
</style>
