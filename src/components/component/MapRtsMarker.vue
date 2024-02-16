<script setup lang="ts">
import maplibregl from "maplibre-gl";

import type { Rts, Station } from "../../scripts/class/api";
import RtsMarker from "./RtsMarker.vue";

defineProps<{
  map: maplibregl.Map;
  stations: Record<string, Station>;
  rts: Rts;
  hideNonAlert: boolean;
}>();
</script>

<template lang="pug">
template(v-for="(station, id) in stations" :key="id")
  RtsMarker(v-if="!hideNonAlert || (hideNonAlert && rts.station[id]?.alert)", :map="map", :station-id="id" , :station="station", :rts="rts.station[id]", :hide-non-alert="hideNonAlert")
</template>
