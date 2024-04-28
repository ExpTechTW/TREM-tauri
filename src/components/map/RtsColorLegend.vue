<script setup lang="ts">
import {
  InstrumentalIntensityColors,
  IntensityColors,
  IntensityDomain,
  PgaDomain,
  PgvDomain,
} from "@/helpers/constant";
import { useConfigStore } from "@/stores/config_store";

const configStore = useConfigStore();

const titles = ["計測震度", "PGA", "PGV"];
const units = ["", "gal", "cm/s"];
const domains = [IntensityDomain, PgaDomain, PgvDomain];
</script>

<template>
  <div class="rts-color-legend">
    <div class="legend-header">
      <span class="legend-title">
        {{ titles[configStore.earthquake.display] }}
      </span>
      <span v-if="configStore.earthquake.display > 0" class="legend-unit">
        {{ units[configStore.earthquake.display] }}
      </span>
    </div>
    <div class="legend-content">
      <div class="color-bar">
        <svg xmlns="http://www.w3.org/2000/svg" height="140" width="6">
          <defs>
            <linearGradient
              id="legend-color-bar-fill"
              x1="0%"
              x2="0%"
              y1="100%"
              y2="0%"
            >
              <stop
                v-for="(color, i) in configStore.earthquake.display == 0
                  ? InstrumentalIntensityColors
                  : IntensityColors"
                :offset="`${(i / IntensityColors.length) * 100}%`"
                :stop-color="color"
              />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            rx="2"
            ry="2"
            width="6"
            height="100%"
            fill="url(#legend-color-bar-fill)"
          />
        </svg>
      </div>
      <div class="legend-label-container">
        <template v-for="(v, i) in domains[configStore.earthquake.display]">
          <div class="legend-label" :class="`legend-color-stop-${i}`">
            {{ configStore.earthquake.display == 0 ? v : v.toFixed(1) }}
          </div>
        </template>
        <div class="legend-label"></div>
      </div>
    </div>
  </div>
</template>

<style>
.rts-color-legend {
  background-color: var(--p-surface-700);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border-radius: 8px;
  z-index: 500;
}

.legend-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.legend-title {
  font-size: 12px;
  line-height: 100%;
  font-weight: bold;
}

.legend-unit {
  font-size: 10px;
  line-height: 100%;
  opacity: 0.8;
}

.legend-content {
  display: flex;
  gap: 6px;
}

.color-bar {
  display: flex;
  height: 100%;
  margin-top: 8px;
  margin-bottom: 5px;
  padding: 1.5px;
  border-radius: 2px;
  background-color: var(--p-surface-200);
}

.legend-label-container {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
}

.legend-label {
  display: flex;
  align-items: center;
  line-height: 100%;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
</style>
