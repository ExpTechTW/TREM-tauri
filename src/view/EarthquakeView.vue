<script setup lang="ts">
import RtsMarker from "@/components/map/RtsMarker.vue";
import RtsColorLegend from "@/components/map/RtsColorLegend.vue";

import { computed, onMounted } from "vue";
import { useRtsStore } from "@/stores/rts_store";
import { useStationStore } from "@/stores/station_store";

import Global from "@/global";
import TimeDisplay from "@/components/misc/TimeDisplay.vue";

const rtsStore = useRtsStore();
const stationStore = useStationStore();

const currentTime = computed(() => {
  if (rtsStore.time) return rtsStore.time;
  return Date.now();
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
