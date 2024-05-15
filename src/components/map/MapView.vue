<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { Map as MaplibreMap } from "maplibre-gl";
import { getCurrent } from "@tauri-apps/api/window";
import { useMapStore } from "@/stores/map_store";

import type { MapColorScheme } from "./MapView";
import "maplibre-gl/dist/maplibre-gl.css";

const mapStore = useMapStore();

const win = getCurrent();

const MapThemeColors = {
  Light: {
    PrimaryBackgroundColor: "#f8fafc",
    PrimaryStrokeColor: "#94a3b8",
    SecondaryBackgroundColor: "#f8fafc",
    SecondaryStrokeColor: "#cbd5e1",
  },
  Dark: {
    // var(--p-surface-750)
    PrimaryBackgroundColor: "#333338",
    // var(--p-surface-500)
    PrimaryStrokeColor: "#71717a",
    // var(--p-surface-800)
    SecondaryBackgroundColor: "#27272a",
    // var(--p-surface-700)
    SecondaryStrokeColor: "#3f3f46",
  },
};

const setMapTheme = (colorScheme: MapColorScheme) => {
  if (!mapStore.map) return;

  for (const layerId of ["cn", "jp", "kp", "kr"]) {
    mapStore.map.setPaintProperty(
      layerId,
      "fill-color",
      colorScheme.SecondaryBackgroundColor
    );
    mapStore.map.setPaintProperty(
      layerId,
      "fill-outline-color",
      colorScheme.SecondaryBackgroundColor
    );
  }

  mapStore.map.setPaintProperty(
    "county",
    "fill-color",
    colorScheme.PrimaryBackgroundColor
  );

  mapStore.map.setPaintProperty(
    "county_outline",
    "line-color",
    colorScheme.SecondaryBackgroundColor
  );

  mapStore.map.setPaintProperty("town", "fill-color", [
    "match",
    ["number", ["feature-state", "intensity"], 0],
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
    colorScheme.PrimaryBackgroundColor,
  ]);
};

const uThemeChanged = win.onThemeChanged((event) => {
  if (event.payload == "light") {
    setMapTheme(MapThemeColors.Light);
  } else {
    setMapTheme(MapThemeColors.Dark);
  }
});

onMounted(() => {
  const initialState = { lng: 120.5, lat: 23.6, zoom: 6.75 };

  const map = new MaplibreMap({
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
    attributionControl: false,
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom,
    keyboard: false,
    dragRotate: false,
    touchPitch: false,
    renderWorldCopies: false,
  });

  map.on("load", async () => {
    const theme = (await win.theme()) == "light" ? "Light" : "Dark";
    const colorTheme = MapThemeColors[theme];

    const secondaryPaintProperty = {
      "fill-color": colorTheme.SecondaryBackgroundColor,
      "fill-opacity": 1,
      "fill-outline-color": colorTheme.SecondaryStrokeColor,
    };

    map
      .addLayer({
        id: "cn",
        type: "fill",
        source: "cn",
        layout: {},
        paint: secondaryPaintProperty,
      })
      .addLayer({
        id: "jp",
        type: "fill",
        source: "jp",
        layout: {},
        paint: secondaryPaintProperty,
      })
      .addLayer({
        id: "kp",
        type: "fill",
        source: "kp",
        layout: {},
        paint: secondaryPaintProperty,
      })
      .addLayer({
        id: "kr",
        type: "fill",
        source: "kr",
        layout: {},
        paint: secondaryPaintProperty,
      })
      .addLayer({
        id: "county",
        type: "fill",
        source: "tw_county",
        layout: {},
        paint: {
          "fill-color": [
            "match",
            ["number", ["feature-state", "intensity"], 0],
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
            colorTheme.PrimaryBackgroundColor,
          ],
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
            ["number", ["feature-state", "intensity"], 0],
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
            colorTheme.PrimaryBackgroundColor,
          ],
          "fill-opacity": [
            "case",
            [">=", ["number", ["feature-state", "intensity"], -1], 0],
            1,
            0,
          ],
          "fill-outline-color": [
            "case",
            ["boolean", ["feature-state", "override"], false],
            "#fff",
            "#8691a4",
          ],
        },
      })
      .addLayer({
        id: "county_outline",
        type: "line",
        source: "tw_county",
        layout: {},
        paint: {
          "line-color": colorTheme.PrimaryStrokeColor,
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
            ["number", ["feature-state", "intensity"], 0],
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
            [">=", ["number", ["feature-state", "intensity"], -1], 0],
            1,
            0,
          ],
        },
        layout: {
          visibility: "none",
        },
      });
  });

  // @ts-ignore
  mapStore.value = map;
});

onUnmounted(() => {
  mapStore.value?.remove();
  uThemeChanged.then((f) => f());
});
</script>

<template>
  <div id="map"></div>
</template>

<style scoped>
#map {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
