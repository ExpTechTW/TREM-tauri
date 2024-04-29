<script setup lang="ts">
import Intensity from "../misc/Intensity.vue";

import { onMounted, onUnmounted, ref } from "vue";
import { Marker, Popup, type LngLatLike } from "maplibre-gl";
import { scale } from "chroma-js";
import { useMapStore } from "@/stores/map_store";

import {
  InstrumentalIntensityColors,
  IntensityColors,
  IntensityDomain,
  PgaDomain,
  PgvDomain,
} from "@/helpers/constant";
import { useConfigStore } from "@/stores/config_store";
import { roundIntensity } from "@/helpers/utils";

import type { RtsStation, Station } from "#/@exptechtw/api-wrapper/dist/types";
import codes from "@/assets/json/code.json";
import Tag from "primevue/tag";

const i = scale(InstrumentalIntensityColors).domain(IntensityDomain);
const pga = scale(IntensityColors).domain(PgaDomain);
const pgv = scale(IntensityColors).domain(PgvDomain);

const configStore = useConfigStore();

const props = withDefaults(
  defineProps<{
    id: string;
    station: Station;
    lnglat: LngLatLike;
    rts?: RtsStation;
    alert?: boolean;
  }>(),
  {
    alert: false,
    zIndex: 1,
  }
);

const mapStore = useMapStore();

let marker: Marker;
const popup = new Popup({
  closeButton: false,
  offset: 16,
  maxWidth: "none",
}).setLngLat(props.lnglat);

const zIndexOverride = ref<number>();
const markerElement = ref<HTMLDivElement>();
const rtsMarkerPopupElement = ref<HTMLDivElement>();

const info = codes[`${props.station.info[0].code}` as keyof typeof codes];

const markerMouseover = () => {
  if (mapStore.map) {
    popup.addTo(mapStore.map);
  }
  zIndexOverride.value = 99;
};

const markerMouseleave = () => {
  popup.remove();
  zIndexOverride.value = undefined;
};

const getMarkerColor = (rts: RtsStation) => {
  switch (configStore.earthquake.display) {
    case 1:
      return pga(rts.pga).hex();

    case 2:
      return pgv(rts.pgv).hex();

    default:
      return i(rts.i).hex();
  }
};

onMounted(() => {
  if (mapStore.map) {
    marker = new Marker({
      element: markerElement.value,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);

    if (rtsMarkerPopupElement.value) {
      popup.setDOMContent(rtsMarkerPopupElement.value);
    }
  }
});

onUnmounted(() => {
  marker.remove();
  popup.remove();
});
</script>

<template>
  <div
    ref="markerElement"
    :id="`rts-marker-${id}`"
    class="rts-marker"
    :style="{
      backgroundColor: rts ? getMarkerColor(rts) : '',
      zIndex: rts ? rts.i + 10 : 1,
    }"
    @mouseover="markerMouseover"
    @mouseleave="markerMouseleave"
  ></div>

  <div ref="rtsMarkerPopupElement" class="rts-popup-item">
    <div class="rts-popup-container">
      <div class="rts-popup-leading">
        <Intensity :intensity="rts ? roundIntensity(rts.i) : null" />
        <span class="caption">震度階</span>
      </div>
      <div class="rts-popup-content">
        <div class="rts-popup-header">
          <div class="rts-popup-title">{{ id }}</div>
          <Tag
            :severity="station.net == 'MS-Net' ? 'warning' : 'info'"
            :value="station.net"
          />
        </div>
        <div class="rts-popup-subtitle">
          <span v-if="info">
            {{ station.info[0].code }} {{ info.city }} {{ info.town }}
          </span>
        </div>
        <div class="rts-popup-info">
          <div class="rts-info">
            <span class="rts-info-label">計測震度</span>
            <span>{{ rts?.i ?? "-" }}</span>
          </div>
          <div class="rts-info">
            <span class="rts-info-label">衰減震度</span>
            <span>{{ rts?.I ?? "-" }}</span>
          </div>
          <div class="rts-info">
            <span class="rts-info-label"
              >PGA <span class="rts-info-unit">gal</span></span
            >
            <span>{{ rts?.pga ?? "-" }}</span>
          </div>
          <div class="rts-info">
            <span class="rts-info-label"
              >PGV <span class="rts-info-unit">cm/s</span></span
            >
            <span>{{ rts?.pgv ?? "-" }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rts-marker {
  height: 8px;
  width: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 64px;
  font-weight: 600;
  border: 1px solid var(--p-surface-500);
  transition: background-color 0.1s ease-out;
  cursor: pointer;
  pointer-events: all;
}

.rts-popup-item {
  z-index: 500;
}

.rts-popup-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rts-popup-leading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.caption {
  line-height: 100%;
  font-size: 10px;
}

.rts-popup-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 110%;
  font-variant-numeric: tabular-nums;
}

.rts-popup-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rts-popup-title {
  flex: 1;
  font-weight: bold;
  font-size: 14px;
}

.rts-popup-subtitle {
  opacity: 0.8;
}

.rts-popup-info {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  font-size: 10px;
}

.rts-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rts-info-label {
  flex: 1;
  font-weight: bold;
}

.rts-info-unit {
  opacity: 0.6;
  font-weight: normal;
}
</style>
