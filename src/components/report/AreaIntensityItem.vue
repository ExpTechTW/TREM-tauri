<script setup lang="ts">
import StationIntensityItem from "./StationIntensityItem.vue";

import type { AreaIntensity } from "@exptechtw/api-wrapper";

defineProps<{
  area: AreaIntensity;
}>();
</script>

<template>
  <div class="area-intensity-item">
    <span class="area-name">{{ area.area }}</span>
    <template
      v-for="station in area.stations"
      :key="`${area.area} ${station.station}`"
    >
      <StationIntensityItem :area="area.area" :station="station" />
    </template>
  </div>
</template>

<style scoped>
.area-intensity-item {
  padding: 4px;
  display: flex;
  flex-direction: column;
}

.area-name {
  font-size: smaller;
  color: var(--p-primary-color);
}
</style>
