<script setup lang="ts">
import CrossMarker from "./CrossMarker.vue";

import { onMounted, onBeforeUnmount, ref } from "vue";
import maplibregl from "maplibre-gl";

import type { PartialReport } from "../../scripts/class/api";
import { TaiwanBounds } from "../../scripts/helper/constant";
import { getMarkerSizeOnZoom } from "../../scripts/helper/utils";

const props = defineProps<{
  map: maplibregl.Map;
  reports: PartialReport[];
  changeReport(report: PartialReport): void;
}>();

const markers: maplibregl.Marker[] = [];
const markerSize = ref(getMarkerSizeOnZoom(props.map.getZoom()));
const reportMarkerTemplate = ref<Record<string, any>>({});

const scaleMarker = () => {
  markerSize.value = getMarkerSizeOnZoom(props.map.getZoom());
};

onMounted(() => {
  for (let i = 0, n = props.reports.length; i < n; i++) {
    const report = props.reports[i];

    const marker = new maplibregl.Marker({
      element: reportMarkerTemplate.value[report.id].$el,
    })
      .setLngLat([report.lon, report.lat])
      .setOpacity(`${((n - i) / n) * 0.5 + 0.5}`)
      .addTo(props.map);

    markers.push(marker);
  }

  props.map.fitBounds(TaiwanBounds, {
    padding: { top: 16, right: 316, bottom: 16, left: 32 },
    duration: 200,
  });

  props.map.on("zoom", scaleMarker);
});

onBeforeUnmount(() => {
  for (const marker of markers) {
    marker.remove();
  }

  props.map.off("zoom", scaleMarker);
});
</script>

<template lang="pug">
template(v-for="(report, i) in reports" :key="report.id")
  CrossMarker.report-list-marker(:ref="(el) => reportMarkerTemplate[report.id] = el", :int="report.int", :size="(markerSize - 24) + 4 * report.mag", :z-index="reports.length - i", @click="changeReport(report)")
</template>

<style lang="scss" scoped>
.report-list-marker {
  cursor: pointer;
}
</style>
