<script setup lang="ts">
import { toFormattedTimeString } from "@/helpers/utils";
defineProps<{
  time: number;
}>();
</script>

<template>
  <div class="time-display">
    {{ toFormattedTimeString(time) }}
  </div>
</template>

<style scoped>
.time-display {
  position: absolute;
  left: 8px;
  bottom: 4px;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid var(--p-surface-600);
  background-color: var(--p-surface-800);
  line-height: 100%;
  font-size: 12px;
  z-index: 900;
}
</style>
