<script setup lang="ts">
import type { AreaIntensity } from "#/@exptechtw/api-wrapper/dist/types";
import StationIntensityItem from "./StationIntensityItem.vue";

defineProps<{
  area: AreaIntensity;
}>();
</script>

<template>
  <div class="area-intensity-item">
    {{ area.area }}
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
</style>
