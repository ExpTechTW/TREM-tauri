<script setup lang="ts">
import MapEew from "../component/MapEew.vue";
import MapEewIntensity from "../component/MapEewIntensity.vue";
import MapHomeViewControl from "../component/MapHomeViewControl.vue";
import MapLocalMarker from "../component/MapLocalMarker.vue";
import MapReportListMarker from "../component/MapReportListMarker.vue";
import MapReportMarker from "../component/MapReportMarker.vue";
import MapRtsBox from "../component/MapRtsBox.vue";
import MapRtsMarker from "../component/MapRtsMarker.vue";

import { markRaw, onMounted, onUnmounted, shallowRef, inject } from "vue";
import type { Ref } from "vue";
import { SettingsManager } from "tauri-settings";
import maplibregl from "maplibre-gl";

import type {
  Station,
  Report,
  Rts,
  PartialReport,
} from "../../scripts/class/api";
import type { DefaultSettingSchema, EewEvent } from "../../types";

defineProps<{
  currentView: string;
  reports: PartialReport[];
  activeReport?: Report;
  stations: Ref<Record<string, Station>>;
  rts: Ref<Rts>;
  eew: Record<string, EewEvent>;
  currentEewIndex: Ref<string>;
  changeReport(report: PartialReport): void;
}>();

const map = shallowRef<maplibregl.Map | null>(null);
const setting = inject<SettingsManager<DefaultSettingSchema>>("settings");

onMounted(() => {
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
            data: "./map/tw_county.json",
            tolerance: 1,
          },
          tw_town: {
            type: "geojson",
            data: "./map/tw_town.json",
          },
          cn: {
            type: "geojson",
            data: "./map/cn.json",
            tolerance: 1,
          },
          jp: {
            type: "geojson",
            data: "./map/jp.json",
            tolerance: 1,
          },
          kp: {
            type: "geojson",
            data: "./map/kp.json",
            tolerance: 1,
          },
          kr: {
            type: "geojson",
            data: "./map/kr.json",
            tolerance: 1,
          },
          box: {
            type: "geojson",
            data: "./map/box.json",
          },
        },
        layers: [],
      },
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      keyboard: false,
      dragRotate: false,
      touchPitch: false,
      renderWorldCopies: false,
    })
  );

  map.value.on("load", () => {
    if (!map.value) return;

    map.value
      .addLayer({
        id: "cn",
        type: "fill",
        source: "cn",
        layout: {},
        paint: {
          "fill-color": "#383c43",
          "fill-opacity": 1,
          "fill-outline-color": "#545f70",
        },
      })
      .addLayer({
        id: "jp",
        type: "fill",
        source: "jp",
        layout: {},
        paint: {
          "fill-color": "#383c43",
          "fill-opacity": 1,
          "fill-outline-color": "#545f70",
        },
      })
      .addLayer({
        id: "kp",
        type: "fill",
        source: "kp",
        layout: {},
        paint: {
          "fill-color": "#383c43",
          "fill-opacity": 1,
          "fill-outline-color": "#545f70",
        },
      })
      .addLayer({
        id: "kr",
        type: "fill",
        source: "kr",
        layout: {},
        paint: {
          "fill-color": "#383c43",
          "fill-opacity": 1,
          "fill-outline-color": "#545f70",
        },
      })
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
        id: "town",
        type: "fill",
        source: "tw_town",
        layout: {
          visibility: "none",
        },
        paint: {
          "fill-color": [
            "match",
            ["coalesce", ["feature-state", "int"], 0],
            9,
            "#9600c8",
            8,
            "#c00000",
            7,
            "#ff0000",
            6,
            "#ff6400",
            5,
            "#ff9600",
            4,
            "#ffc800",
            3,
            "#1e9632",
            2,
            "#0070e0",
            1,
            "#004080",
            "#43474e",
          ],
          "fill-opacity": [
            "case",
            [">=", ["coalesce", ["feature-state", "int"], -1], 0],
            1,
            0,
          ],
          "fill-outline-color": "#8691a4",
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
  if (map.value) map.value.remove();
});
</script>

<template lang="pug">
#map.map-container.maplibregl-map(:class="{ 'hide-rts-markers': currentView.startsWith('report'), 'hide-report-list-markers': currentView != 'report-list' }")
.map-layers(v-if="map")
  .home(v-if="!Object.keys(eew).length && currentView == 'home'")
    MapHomeViewControl(:map="map")
  .report-list(v-if="currentView == 'report-list'")
    MapReportListMarker(:map="map", :reports="reports", :change-report="changeReport")
  .active-report(v-if="activeReport && currentView == 'report'")
    MapReportMarker(:map="map", :report="activeReport")
  .rts(v-if="stations && currentView == 'home'")
    MapRtsMarker(:map="map", :stations="stations", :rts="rts", :hide-non-alert="!!Object.keys(eew).length")
  .rts-box(v-if="Object.keys(rts.value.box).length")
    MapRtsBox(:map="map", :box="rts.value.box")
  .eew(v-if="Object.keys(eew).length && currentView == 'home'")
    MapEew(:map="map", :eew="eew")
  .eew-town-intensity(v-if="currentEewIndex.value && currentView == 'home'")
    MapEewIntensity(:map="map", :int="eew[currentEewIndex.value].int")
  .location(v-if="setting?.settings.location.lat && setting?.settings.location.lng")
    MapLocalMarker(:map="map", :lat="setting.settings.location.lat", :lng="setting.settings.location.lng")
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
