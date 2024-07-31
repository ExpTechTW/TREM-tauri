<script setup lang="ts">
import {
  type DataDrivenPropertyValueSpecification,
  GeoJSONSource,
  Map as MaplibreMap,
  type SymbolLayerSpecification,
} from "maplibre-gl";

import type { MapColorScheme } from "./MapView";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { featureCollection, point } from "@turf/turf";

const mapStore = useMapStore();
const reportStore = useReportStore();

const win = getCurrentWindow();

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

reportStore.$subscribe((mutation, state) => {
  if (!mapStore.map) return;

  const source = mapStore.map.getSource("reports");

  if (!(source instanceof GeoJSONSource)) return;

  const features = state.partial.map((report) =>
    point([report.lon, report.lat], report)
  );

  source.setData(featureCollection(features));
});

onMounted(async () => {
  const theme = (await win.theme()) == "light" ? "Light" : "Dark";
  const colorTheme = MapThemeColors[theme];

  const initialState = { lng: 120.5, lat: 23.6, zoom: 6.75 };

  const intensityFillColor = [
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
  ] satisfies DataDrivenPropertyValueSpecification<string>;

  const map = new MaplibreMap({
    container: "map",
    style: {
      version: 8,
      name: "TREM Map",
      sources: {
        map: {
          type: "vector",
          url: "https://api-1.exptech.dev/api/v1/map/tiles/tiles.json",
        },
        box: {
          type: "geojson",
          data: "./map/box.json",
        },
        reports: {
          type: "geojson",
          data: featureCollection([]),
        },
      },
      layers: [
        {
          id: "county",
          type: "fill",
          source: "map",
          "source-layer": "city",
          paint: {
            "fill-color": intensityFillColor,
            "fill-opacity": 1,
          },
        },
        {
          id: "town",
          type: "fill",
          source: "map",
          "source-layer": "town",
          paint: {
            "fill-color": intensityFillColor,
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
        },
        {
          id: "county-outline",
          source: "map",
          "source-layer": "city",
          type: "line",
          paint: {
            "line-color": colorTheme.PrimaryStrokeColor,
          },
        },
        {
          id: "global",
          type: "fill",
          source: "map",
          "source-layer": "global",
          paint: {
            "fill-color": colorTheme.SecondaryBackgroundColor,
            "fill-opacity": 1,
            "fill-outline-color": colorTheme.SecondaryStrokeColor,
          },
        },
        {
          id: "tsunami",
          type: "line",
          source: "map",
          "source-layer": "tsunami",
          paint: {
            "line-opacity": 0,
            "line-width": 10,
          },
        },
        {
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
        },
        {
          id: "reports",
          type: "symbol",
          source: "reports",
          layout: {
            "icon-image": ["concat", "cross-", ["get", "int"]],
          },
        },
      ],
      sprite: "https://exptech.dev/assets/poi/sprite",
    },
    attributionControl: false,
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom,
    keyboard: false,
    dragRotate: false,
    touchPitch: false,
    renderWorldCopies: false,
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
