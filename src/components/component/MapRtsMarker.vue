<script setup lang="ts">
import type { Ref } from "vue";
import maplibregl from "maplibre-gl";

import type { Rts, Station } from "../../scripts/class/api";
import RtsMarker from "./RtsMarker.vue";

defineProps<{
  map: maplibregl.Map;
  stations: Ref<Record<string, Station>>;
  rts: Ref<Rts>;
  hideNonAlert: boolean;
}>();
</script>

<template lang="pug">
template(v-for="(station, id) in stations.value" :key="id")
  RtsMarker(v-if="!hideNonAlert || (hideNonAlert && rts.value.station[id]?.alert)", :map="map", :station-id="id" , :station="station", :rts="rts.value.station[id]", :hide-non-alert="hideNonAlert")
</template>
