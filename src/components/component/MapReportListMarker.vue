<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import maplibregl from "maplibre-gl";

import type { PartialReport } from '../../scripts/class/api';
import CrossMarker from './CrossMarker.vue';

const { map, reports } = defineProps<{
  map: maplibregl.Map;
  reports: PartialReport[];
}>();

const markers: maplibregl.Marker[] = [];
const reportMarkerTemplate = ref<Record<string, any>>({});

onMounted(() => {
  for (const i in reports) {
    const report = reports[i];

    const marker = new maplibregl.Marker({ element: reportMarkerTemplate.value[report.id].$el })
      .setLngLat([report.lon, report.lat])
      .setOpacity(`${1 * (+i / reports.length)}`)
      .addTo(map);

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
template(v-for="report in reports")
  CrossMarker.report-list-marker(:int="report.int", :size="16 + 4 * report.mag", :ref="(el) => reportMarkerTemplate[report.id] = el")
</template>