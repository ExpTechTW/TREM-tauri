<script setup lang="ts">
import EewMarker from "@/components/map/EewMarker.vue";
import RtsMarker from "@/components/map/RtsMarker.vue";
import RtsColorLegend from "@/components/map/RtsColorLegend.vue";
import TimeDisplay from "@/components/misc/TimeDisplay.vue";

import { computed, onMounted } from "vue";
import { useEewStore } from "@/stores/eew_store";
import { useRtsStore } from "@/stores/rts_store";
import { useStationStore } from "@/stores/station_store";

import type { EewType } from "@exptechtw/api-wrapper";
import Global from "@/global";

const eewStore = useEewStore();
const rtsStore = useRtsStore();
const stationStore = useStationStore();

const currentTime = computed(() => {
  if (rtsStore.time) return rtsStore.time;
  return Date.now();
});

const currentEewState = computed((): EewType[] => {
  return Object.values(eewStore.eew).filter(
    (v) => currentTime.value - v.eq.time < 120_000
  );
});

onMounted(() => {
  Global.api.getStations().then((v) => {
    stationStore.$patch({ value: v });
  });
});
</script>

<template>
  <div id="earthquake">
    <template v-if="stationStore.value" v-for="(s, id) in stationStore.value">
      <RtsMarker
        :id="id"
        :station="s"
        :lnglat="[s.info[0].lon, s.info[0].lat]"
        :rts="rtsStore.station[id]"
      />
    </template>
    <template v-for="eew in currentEewState" :key="eew.id">
      <EewMarker :eew="eew" :time="currentTime" />
    </template>
    <RtsColorLegend id="rts-color-legend" />
    <TimeDisplay :time="currentTime" />
  </div>
</template>

<style scoped>
.rts-color-legend {
  position: absolute;
  bottom: 8px;
  right: 8px;
}
</style>
