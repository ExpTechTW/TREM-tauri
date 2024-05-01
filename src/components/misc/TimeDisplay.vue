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
  left: 6px;
  bottom: 6px;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid var(--t-outline-color);
  background-color: var(--t-surface-elevated-color);
  line-height: 100%;
  font-size: 12px;
  z-index: 900;
}
</style>
