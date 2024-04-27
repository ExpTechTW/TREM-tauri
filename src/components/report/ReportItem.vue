<script setup lang="ts">
import Intensity from "../misc/Intensity.vue";
import CrossMarker from "../map/CrossMarker.vue";

import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Popup } from "maplibre-gl";
import {
  extractLocationFromString,
  toFormattedTimeString,
} from "@/helpers/utils";
import { useMapStore } from "@/stores/map_store";

import type { PartialReport } from "#/@exptechtw/api-wrapper/dist/types";

const props = defineProps<{
  report: PartialReport;
  markerOpacity?: number;
  markerZIndex?: number;
}>();

const router = useRouter();
const mapStore = useMapStore();
const highlighted = ref(false);
const reportMarkerPopupElement = ref<HTMLDivElement>();
const opacityOverride = ref<number>();
const zIndexOverride = ref<number>();
const popup = new Popup({ closeButton: false, offset: 24 }).setLngLat([
  props.report.lon,
  props.report.lat,
]);

const navigate = () => {
  router.push({ path: `/report/${props.report.id}` });
};

const markerMouseover = () => {
  highlighted.value = true;
  if (mapStore.map) {
    popup.addTo(mapStore.map);
  }
  opacityOverride.value = 1;
  zIndexOverride.value = 99;
};

const markerMouseleave = () => {
  highlighted.value = false;
  popup.remove();
  opacityOverride.value = undefined;
  zIndexOverride.value = undefined;
};

onMounted(() => {
  if (reportMarkerPopupElement.value) {
    popup.setDOMContent(reportMarkerPopupElement.value);
  }
});

onUnmounted(() => {
  popup.remove();
});
</script>

<template>
  <div
    v-ripple
    class="report-item"
    :class="{ numbered: report.no % 1000, highlighted }"
    tabindex="0"
    @click="navigate"
  >
    <Intensity :intensity="report.int" />
    <div class="report-item-content">
      <div class="report-title">
        {{
          report.no % 1000
            ? `第 ${report.no % 1000} 號有感地震`
            : extractLocationFromString(report.loc)
        }}
      </div>
      <div class="report-info">
        <span>{{ toFormattedTimeString(report.time) }}</span>
        <span>
          規模 M {{ report.mag.toFixed(1) }} 深度 {{ report.depth }} km
        </span>
      </div>
    </div>
    <CrossMarker
      class="report-marker"
      :lnglat="[report.lon, report.lat]"
      :intensity="report.int"
      :size="report.mag * 6"
      :opacity="opacityOverride ?? markerOpacity"
      :zIndex="zIndexOverride ?? markerZIndex"
      @click="navigate"
      @mouseover="markerMouseover"
      @mouseleave="markerMouseleave"
    />
  </div>
  <div
    ref="reportMarkerPopupElement"
    class="report-popup-item"
    :class="{ numbered: report.no % 1000 }"
  >
    <Intensity :intensity="report.int" />
    <div class="report-popup-content">
      <div class="report-popup-title">
        {{
          report.no % 1000
            ? `第 ${report.no % 1000} 號有感地震`
            : extractLocationFromString(report.loc)
        }}
      </div>
      <div class="report-popup-info">
        <span>{{ toFormattedTimeString(report.time) }}</span>
        <span>
          規模 M {{ report.mag.toFixed(1) }} 深度 {{ report.depth }} km
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-item,
.report-popup-item {
  position: relative;
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
  overflow: hidden;
  transition: background-color 0.1s ease-in-out;
}

.report-item {
  padding: 8px 12px;
  margin: 2px;
  border-radius: 8px;
  cursor: pointer;
}

.report-popup-item {
  padding: 0 4px;
}

.report-item.highlighted,
.report-item:hover {
  background-color: var(--p-highlight-background);
}

.report-item:focus-visible {
  outline: 2px solid var(--p-primary-color);
}

.report-item-content,
.report-popup-content {
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  white-space: nowrap;
}

.report-title {
  font-size: 15px;
  line-height: 150%;
}

.report-popup-title {
  font-size: 14px;
  line-height: 150%;
}

.report-item.numbered .report-title,
.report-popup-item.numbered .report-popup-title {
  font-weight: bold;
}

.report-info,
.report-popup-info {
  display: flex;
  flex-direction: column;
  opacity: 0.65;
  font-size: 12px;
  line-height: 140%;
}

.report-marker {
  cursor: pointer;
}

.report-marker-popup {
  z-index: 999;
}
</style>
