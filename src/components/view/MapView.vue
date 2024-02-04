<script setup lang="ts">
import CircleMarker from "../component/CircleMarker.vue";
import MapHomeViewControl from "../component/MapHomeViewControl.vue";
import MapReportListMarker from "../component/MapReportListMarker.vue";
import MapReportMarker from "../component/MapReportMarker.vue";
import MapRtsBox from "../component/MapRtsBox.vue";
import MapRtsMarker from "../component/MapRtsMarker.vue";

import { markRaw, onMounted, onUnmounted, shallowRef } from "vue";
import type { Ref } from "vue";
import maplibregl from "maplibre-gl";

import type {
  Station,
  Report,
  Rts,
  PartialReport,
} from "../../scripts/class/api";

defineProps<{
  currentView: string;
  reports: PartialReport[];
  activeReport?: Report;
  stations: Ref<Record<string, Station>>;
  rts: Ref<Rts>;
}>();

const map = shallowRef<maplibregl.Map | null>(null);

const radius = shallowRef(10);

onMounted(() => {
  setInterval(() => (radius.value += 1), 500);

  const initialState = { lng: 120.5, lat: 23.6, zoom: 6.75 };

  map.value = markRaw(
    new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        name: "TREM Map",
        sources: {
          tw_county: {
            type: "geojson",
            data: "./tw_county.json",
            tolerance: 1,
          },
          tw_town: {
            type: "geojson",
            data: "./tw_town.json",
          },
          box: {
            type: "geojson",
            data: "./box.json",
          },
        },
        layers: [],
      },
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      keyboard: false,
      dragRotate: false,
      touchPitch: false,
    })
  );

  map.value.on("load", () => {
    if (!map.value) return;

    map.value
      .addLayer({
        id: "county",
        type: "fill",
        source: "tw_county",
        layout: {},
        paint: {
          "fill-color": "#43474e",
          "fill-opacity": 1,
        },
      })
      .addLayer({
        id: "county_outline",
        type: "line",
        source: "tw_county",
        layout: {},
        paint: {
          "line-color": "#bcc7db",
          "line-opacity": 1,
          "line-width": 0.6,
        },
      })
      .addLayer({
        id: "box",
        type: "line",
        source: "box",
        paint: {
          "line-color": [
            "match",
            ["coalesce", ["feature-state", "int"], 0],
            9,
            "#f22",
            8,
            "#f22",
            7,
            "#f22",
            6,
            "#f22",
            5,
            "#f22",
            4,
            "#f22",
            3,
            "#ff2",
            2,
            "#ff2",
            1,
            "#2f2",
            "#2f2",
          ],
          "line-offset": 1.5,
          "line-width": 3,
          "line-opacity": [
            "case",
            [">=", ["coalesce", ["feature-state", "int"], -1], 0],
            1,
            0,
          ],
        },
        layout: {
          visibility: "none",
        },
      });
  });
});

onUnmounted(() => {
  map.value?.remove();
});
</script>

<template lang="pug">
#map.map-container.maplibregl-map(:class="{ 'hide-rts-markers': currentView.startsWith('report'), 'hide-report-list-markers': currentView != 'report-list' }")
.map-layers(v-if="map")
  .circle
    CircleMarker(:map="map", type="s", :radius="radius", :lng="121.53697824593353", :lat="25.29965458828072", :alert="true", :z-index="1000")
  .home(v-if="currentView == 'home'")
    MapHomeViewControl(:map="map")
  .report-list(v-if="currentView == 'report-list'")
    MapReportListMarker(:map="map", :reports="reports")
  .active-report(v-if="activeReport && currentView == 'report'")
    MapReportMarker(:map="map", :report="activeReport")
  .rts(v-if="stations")
    MapRtsMarker(:map="map", :stations="stations", :rts="rts")
  .rts-box(v-if="Object.keys(rts.value.box).length")
    MapRtsBox(:map="map", :box="rts.value.box")
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

.map-layers {
  display: none;
}
</style>
