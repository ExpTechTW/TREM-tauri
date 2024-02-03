<script setup lang="ts">
import MapReportMarker from '../component/MapReportMarker.vue';
import MapRtsMarker from '../component/MapRtsMarker.vue';

import { inject, markRaw, onMounted, onUnmounted, shallowRef } from 'vue';
import type { Ref } from 'vue';
import maplibregl from "maplibre-gl";

import type { Station, Report, Rts } from '../../scripts/class/api';

defineProps<{
  currentView: string;
  activeReport?: Report;
  rts: Ref<Rts>;
}>();

const stations = inject<Record<string, Station> | undefined>('stations');

const map = shallowRef<maplibregl.Map | null>(null);

onMounted(() => {
  const initialState = { lng: 120.5, lat: 23.6, zoom: 6.75 };

  map.value = markRaw(new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      name: "TREM Map",
      sources: {
        tw_county: {
          type: "geojson",
          data: "./tw_county.json",
          tolerance: 1
        },
        tw_town: {
          type: "geojson",
          data: "./tw_town.json"
        }
      },
      layers: []
    },
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom
  }));

  map.value.on("load", () => {
    if (!map.value) return;

    map.value.addLayer({
      id: "county",
      type: "fill",
      source: "tw_county",
      layout: {},
      paint: {
        "fill-color": "#43474e",
        "fill-opacity": 1
      }
    })
      .addLayer({
        id: "county_outline",
        type: "line",
        source: "tw_county",
        layout: {},
        paint: {
          "line-color": "#bcc7db",
          "line-opacity": 1,
          "line-width": 0.6
        }
      });
  });
});

onUnmounted(() => {
  map.value?.remove();
});
</script>

<template lang="pug">
#map.map-container.maplibregl-map(:class="{ 'hide-rts-markers': currentView.startsWith('report') }")
.map-layers(v-if="map")
  .active-report(v-if="activeReport && currentView == 'report'")
    MapReportMarker(:map="map", :report="activeReport")
  .rts(v-if="stations")
    MapRtsMarker(:map="map", :stations="stations", :rts="rts")
</template>

<style>
.map-container {
  position: absolute;
  inset: 0;
  height: 100svh;
  width: 100svw;

  &.hide-rts-markers .rts-marker {
    opacity: 0 !important;
  }
}
</style>
