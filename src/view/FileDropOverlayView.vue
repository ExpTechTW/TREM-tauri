<script setup lang="ts">
defineProps<{
  isVisible: boolean;
}>();
</script>

<template>
  <div class="file-drop-overlay" :class="{ show: isVisible }">
    <div class="file-drop-container"></div>
  </div>
</template>

<style scoped>
.file-drop-overlay {
  display: grid;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  padding: 16px;
  opacity: 0;
  backdrop-filter: blur(64px);
  pointer-events: none;
  transition: opacity 0.4s ease-in-out;
}

.file-drop-overlay.show {
  pointer-events: all;
  opacity: 1;
}

.file-drop-container {
  background-color: var(--p-surface-600);
}
</style>
