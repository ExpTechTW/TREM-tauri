<script setup lang="ts">
import AreaIntensityItem from "@/components/report/AreaIntensityItem.vue";
import Button from "primevue/button";
import CrossMarker from "@/components/map/CrossMarker.vue";
import Intensity from "@/components/misc/Intensity.vue";
import IntensityMarker from "@/components/map/IntensityMarker.vue";
import MaterialSymbols from "@/components/misc/MaterialSymbols.vue";
import ProgressBar from "primevue/progressbar";

import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LngLatBounds } from "maplibre-gl";
import { open } from "@tauri-apps/plugin-shell";
import {
  extractLocationFromString,
  toFormattedTimeString,
  toReportUrl,
} from "@/helpers/utils";
import { useMapStore } from "@/stores/map_store";
import { useReportStore } from "@/stores/report_store";

import type {
  PartialReport,
  Report,
} from "#/@exptechtw/api-wrapper/dist/types";
import Global from "@/global";

const route = useRoute();
const router = useRouter();
const mapStore = useMapStore();
const reportStore = useReportStore();
const report = ref<PartialReport>();
const fullReport = ref<Report>();

const progress = ref(0);
let progressInterval: number;

const back = () => {
  router.back();
};

const openReport = () => {
  if (report.value) {
    const url = toReportUrl(report.value.id);
    open(url).catch(console.error);
  }
};

const setupStationMarkers = (report: Report) => {
  if (!mapStore.map) return;

  const bounds = new LngLatBounds();

  for (const a of report.list) {
    for (const s of a.stations) {
      bounds.extend([s.lon, s.lat]);
    }
  }

  bounds.extend([report.lon, report.lat]);
  window.setTimeout(
    () => mapStore.map?.fitBounds(bounds, { padding: 32, maxZoom: 9 }),
    50
  );
};

onMounted(() => {
  const id = route.params.id as string;

  report.value = reportStore.partial.get(id);
  fullReport.value = reportStore.cache.get(id);

  if (!fullReport.value) {
    progressInterval = window.setInterval(
      () => (progress.value += (25 - progress.value) / 25),
      100
    );

    Global.api.getReport(id).then((v) => {
      progress.value = 100;

      if (progressInterval != undefined) {
        window.clearInterval(progressInterval);
      }

      fullReport.value = v;
      reportStore.set(v);

      if (route.path != `/report/${v.id}`) return;

      setupStationMarkers(v);
    });
  } else {
    progress.value = 100;
    setupStationMarkers(fullReport.value);
  }
});
</script>

<template>
  <div id="report">
    <ProgressBar
      class="progress-bar"
      :class="{ hide: progress == 100 }"
      :value="progress"
      :show-value="false"
      style="left: 0; right: 0; top: 0; height: 4px"
    />
    <Button
      severity="secondary"
      label="返回"
      rounded
      style="top: 16px; left: 16px"
      @click="back"
    >
      <template #icon>
        <MaterialSymbols :icon="`\ue5c4`" style="margin-right: 8px" />
      </template>
    </Button>

    <div v-if="report" class="report-item" style="bottom: 8px; left: 8px">
      <div class="report-item-container">
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
      </div>
      <div v-ripple class="report-open-btn" @click="openReport">
        <MaterialSymbols icon="open_in_new" :size="16" />
      </div>
    </div>

    <div class="side-panel">
      <div class="side-panel-wrapper">
        <template v-for="area in fullReport?.list">
          <AreaIntensityItem :area="area" />
        </template>
      </div>
    </div>

    <template v-for="area in fullReport?.list">
      <template
        v-for="station in area.stations"
        :key="`report-intensity-${area.area}${station.station}`"
      >
        <IntensityMarker
          :lnglat="[station.lon, station.lat]"
          :intensity="station.int"
          :zIndex="station.int"
        />
      </template>
    </template>
    <CrossMarker
      v-if="report"
      :lnglat="[report.lon, report.lat]"
      :zIndex="10"
    />
  </div>
</template>

<style scoped>
#report > * {
  position: absolute;
  pointer-events: all;
}

.progress-bar {
  opacity: 1;
  transition: opacity 0.2s 0.4s ease-in-out;
}

.progress-bar.hide {
  opacity: 0;
}

.report-item {
  display: flex;
  border-radius: 12px;
  background-color: var(--p-surface-800);
  overflow: hidden;
}

.report-item-container {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.report-item-content {
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  white-space: nowrap;
}

.report-title {
  font-size: 16px;
  font-weight: bold;
}

.report-info {
  display: flex;
  flex-direction: column;
  opacity: 0.65;
  font-size: 12px;
  line-height: 150%;
}

.report-open-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  overflow: hidden;
  transition: background-color 0.1s ease-in-out;
}

.report-open-btn:hover {
  background-color: var(--p-highlight-background);
}

.side-panel {
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  max-height: calc(100% - 16px);
  margin: 8px;
}

.side-panel-wrapper {
  padding-right: 4px;
  overflow-y: auto;
}
</style>
