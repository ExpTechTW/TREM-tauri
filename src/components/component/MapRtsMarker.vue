<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import maplibregl from "maplibre-gl";

import type { Rts, Station } from '../../scripts/class/api';
import { pga } from '../../scripts/helper/color';

const { map, stations } = defineProps<{ map: maplibregl.Map; stations: Record<string, Station>; rts: Ref<Rts>; }>();

const bounds = new maplibregl.LngLatBounds();
const markers: maplibregl.Marker[] = [];

const rtsMarkerTemplate: Record<string, any> = {};

onMounted(() => {
  for (const id in stations) {
    const station = stations[id];
    const marker = new maplibregl.Marker({ element: rtsMarkerTemplate[id] })
      .setLngLat([station.info[0].lon, station.info[0].lat])
      .addTo(map);

    bounds.extend(marker.getLngLat());
    markers.push(marker);
  }
});

onUnmounted(() => {
  for (const marker of markers) {
    marker.remove();
  }
});
</script>

<template lang="pug">
.rts-marker(v-for="(_, id) in stations", :ref="(el) => rtsMarkerTemplate[id] = el" :style="{ zIndex: (rts.value.station[id]?.i ??-10) + 10 * 10}")
  .rts-marker-color(:style="rts.value.station[id] ? `background-color: ${pga(rts.value.station[id].i)}`: ''")
</template>

<style scoped>
.rts-marker {
  height: 8px;
  width: 8px;
  border-radius: 4px;
  outline: 1px solid #aaa;
  opacity: 1;
  overflow: hidden;
  transition: opacity .1s cubic-bezier(0.2, 0, 0, 1);
}

.rts-marker-color {
  height: 100%;
  width: 100%;
  transition: background-color .1s cubic-bezier(0.2, 0, 0, 1);
}
</style>