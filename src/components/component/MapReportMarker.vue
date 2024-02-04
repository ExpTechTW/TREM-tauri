<script setup lang="ts">
import CrossMarker from './CrossMarker.vue';

import type { ComponentPublicInstance } from 'vue';
import { onMounted, onUnmounted, ref } from 'vue';
import maplibregl from "maplibre-gl";

import type { Report } from '../../scripts/class/api';
import { TaiwanBounds } from '../../scripts/helper/constant';

const props = defineProps<{ map: maplibregl.Map; report: Report; }>();

const bounds = new maplibregl.LngLatBounds();
const markers: maplibregl.Marker[] = [];

const intensityMarkerTemplate = ref<HTMLDivElement[]>([]);
const epicenterMarkerTemplate = ref<ComponentPublicInstance<typeof CrossMarker>>();

const stations = props.report.list.flatMap(v => v.stations.map(s => ({ ...s, area: v.area })));

onMounted(() => {
  for (const i in stations) {
    const station = stations[i];
    const marker = new maplibregl.Marker({ element: intensityMarkerTemplate.value[i] })
      .setLngLat([station.lon, station.lat])
      .addTo(props.map);

    bounds.extend(marker.getLngLat());
    markers.push(marker);
  }

  const epicenter = new maplibregl.Marker({ element: epicenterMarkerTemplate.value?.$el })
    .setLngLat([props.report.lon, props.report.lat])
    .addTo(props.map);

  markers.push(epicenter);
  bounds.extend(epicenter.getLngLat());

  props.map.fitBounds(bounds, { padding: { top: 48, right: 382, bottom: 48, left: 64 }, maxZoom: 9 });
});

onUnmounted(() => {
  for (const marker of markers) {
    marker.remove();
  }

  props.map.fitBounds(TaiwanBounds, { padding: { top: 16, right: 316, bottom: 16, left: 32 } });
});
</script>

<template lang="pug">
CrossMarker(ref="epicenterMarkerTemplate", :size="32")
template(v-for="station in stations" :key="station.station")
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