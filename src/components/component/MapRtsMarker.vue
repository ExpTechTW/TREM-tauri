<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue';
import type { Ref } from 'vue';
import maplibregl from "maplibre-gl";

import type { Rts, Station } from '../../scripts/class/api';
import { pga } from '../../scripts/helper/color';

const { map, stations } = defineProps<{ map: maplibregl.Map; stations: Ref<Record<string, Station>>; rts: Ref<Rts>; }>();

const bounds = new maplibregl.LngLatBounds();
const markers: Record<string, maplibregl.Marker> = {};

const rtsMarkerTemplate = ref<Record<string, any>>({});

const updateMarker = () => {
  for (const id in stations.value) {
    if (id in markers) continue;

    const station = stations.value[id];

    const marker = new maplibregl.Marker({ element: rtsMarkerTemplate.value[id] })
      .setLngLat([station.info[0].lon, station.info[0].lat])
      .addTo(map);

    bounds.extend(marker.getLngLat());
    markers[id] = marker;
  }
};

onMounted(() => {
  watch(() => stations.value, () => {
    nextTick(() => updateMarker());
  });
});

onUpdated(() => {
});

onUnmounted(() => {
  for (const id in markers) {
    markers[id].remove();
  }
});
</script>

<template lang="pug">
template(v-for="(_, id) in stations.value")
  .rts-marker(:ref="(el) => rtsMarkerTemplate[id] = el", :style="{ zIndex: ((rts.value.station[id]?.i ?? -5) + 5) * 10}")
    .rts-marker-color(:class="(rts.value.station[id] && rts.value.station[id].alert && rts.value.station[id].i >= 1) ? `has-intensity intensity-${~~rts.value.station[id].i}`:''", :style="(rts.value.station[id] && rts.value.station[id].i < 1 ) ? `background-color: ${pga(rts.value.station[id].i)}`: ''")
</template>

<style scoped>
.rts-marker {
  opacity: 1;
  transition: opacity .1s cubic-bezier(0.2, 0, 0, 1);
}

.rts-marker-color {
  display: grid;
  align-items: center;
  justify-content: center;
  height: 8px;
  width: 8px;
  border-radius: 8px;
  outline: 1px solid #aaa;
  overflow: hidden;
  transition: height .1s cubic-bezier(0.2, 0, 0, 1),
    width .1s cubic-bezier(0.2, 0, 0, 1),
    background-color .1s cubic-bezier(0.2, 0, 0, 1);

  &.has-intensity {
    height: 16px;
    width: 16px;
    line-height: 18px;
    font-size: 14px;
    font-weight: 700;
    outline: 2px solid #fff;
    text-align: center;
  }
}
</style>