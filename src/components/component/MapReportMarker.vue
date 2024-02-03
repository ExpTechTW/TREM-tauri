<script setup lang="ts">
import MapCrossMarker from './MapCrossMarker.vue';

import { onMounted, onUnmounted, ref } from 'vue';
import maplibregl from "maplibre-gl";

import type { ComponentPublicInstance } from 'vue';
import type { Report } from '../../scripts/class/api';

const { map, report } = defineProps<{ map: maplibregl.Map; report: Report; }>();

const bounds = new maplibregl.LngLatBounds();
const markers: maplibregl.Marker[] = [];

const intensityMarkerTemplate = ref<HTMLDivElement[]>([]);
const epicenterMarkerTemplate = ref<ComponentPublicInstance<typeof MapCrossMarker>>();

const stations = report.list.flatMap(v => v.stations.map(s => ({ ...s, area: v.area })));

onMounted(() => {
  for (const i in stations) {
    const station = stations[i];
    const marker = new maplibregl.Marker({ element: intensityMarkerTemplate.value[i] })
      .setLngLat([station.lon, station.lat])
      .addTo(map);

    bounds.extend(marker.getLngLat());
    markers.push(marker);
  }

  const epicenter = new maplibregl.Marker({ element: epicenterMarkerTemplate.value?.$el })
    .setLngLat([report.lon, report.lat])
    .addTo(map);

  markers.push(epicenter);
  bounds.extend(epicenter.getLngLat());

  map.fitBounds(bounds, { padding: { top: 48, left: 48, bottom: 48, right: 382 }, maxZoom: 9 });
});

onUnmounted(() => {
  for (const marker of markers) {
    marker.remove();
  }
});
</script>

<template lang="pug">
MapCrossMarker(ref="epicenterMarkerTemplate", :size="32")
template(v-for="station of stations")
  .report-intensity-marker(ref="intensityMarkerTemplate", :class="`intensity-${station.int}`", :style="`z-index:${station.int}`")
</template>

<style scoped>
.report-intensity-marker {
  display: grid;
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;
  border-radius: 4px;
  outline: 1.6px solid #fff;
  line-height: 16px;
  font-size: 14px;
  font-weight: 500;
}
</style>