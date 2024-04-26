<script setup lang="ts">
import type { StationIntensity } from "#/@exptechtw/api-wrapper/dist/types";
import IntensityBlock from "../misc/IntensityBlock.vue";

defineProps<{
  station: StationIntensity;
}>();
</script>

<template>
  <div class="station-intensity-item">
    <IntensityBlock :intensity="station.int" />
    <div class="station-label">{{ station.station }}</div>
  </div>
</template>

<style scoped>
.station-intensity-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
