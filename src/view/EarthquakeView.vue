<script setup lang="ts">
import { onMounted } from "vue";
import { useRtsStore } from "@/stores/rts_store";
import { useStationStore } from "@/stores/station_store";
import Global from "@/global";
import RtsMarker from "@/components/map/RtsMarker.vue";

const rtsStore = useRtsStore();
const stationStore = useStationStore();

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
        :rts="rtsStore.station[id]"
        :lnglat="[s.info[0].lon, s.info[0].lat]"
      />
    </template>
  </div>
</template>
