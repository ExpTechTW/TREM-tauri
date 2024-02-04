<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import maplibregl from "maplibre-gl";

import type { PartialReport } from "../../scripts/class/api";
import CrossMarker from "./CrossMarker.vue";
import { TaiwanBounds } from "../../scripts/helper/constant";

const props = defineProps<{
  map: maplibregl.Map;
  reports: PartialReport[];
}>();

const markers: maplibregl.Marker[] = [];
const reportMarkerTemplate = ref<Record<string, any>>({});

onMounted(() => {
  for (const i in props.reports) {
    const report = props.reports[i];

    const marker = new maplibregl.Marker({
      element: reportMarkerTemplate.value[report.id].$el,
    })
      .setLngLat([report.lon, report.lat])
      .setOpacity(`${1 * (+i / props.reports.length)}`)
      .addTo(props.map);

    markers.push(marker);
  }
  props.map.fitBounds(TaiwanBounds, {
    padding: { top: 16, right: 316, bottom: 16, left: 32 },
    duration: 200,
  });
});

onUnmounted(() => {
  for (const marker of markers) {
    marker.remove();
  }
});
</script>

<template lang="pug">
template(v-for="report in reports" :key="report.id")
  CrossMarker.report-list-marker(:ref="(el) => reportMarkerTemplate[report.id] = el", :int="report.int", :size="16 + 4 * report.mag")
</template>
