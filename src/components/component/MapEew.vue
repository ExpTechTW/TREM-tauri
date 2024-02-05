<script setup lang="ts">
import EEW from "./EEW.vue";

import { onMounted, onUnmounted, ref } from "vue";
import maplibregl from "maplibre-gl";

import type { EewEvent } from "../../types";

const props = defineProps<{
  map: maplibregl.Map;
  eew: Record<string, EewEvent>;
}>();

const eewTemplate = ref<InstanceType<typeof EEW>[]>([]);
let intervals: Record<string, NodeJS.Timeout> = {};

onMounted(() => {
  let crossState = true;

  intervals.cross = setInterval(() => {
    crossState = !crossState;
    for (const eew of eewTemplate.value) {
      eew.redrawCross(crossState);
    }
  }, 500);

  props.map.setLayoutProperty("town", "visibility", "visible");
  props.map.setLayoutProperty("county", "visibility", "none");
});

onUnmounted(() => {
  clearInterval(intervals.wave);
  clearInterval(intervals.cross);

  props.map.setLayoutProperty("county", "visibility", "visible");
  props.map.setLayoutProperty("town", "visibility", "none");
});
</script>

<template lang="pug">
template(v-for="e in eew" :key="e.id")
  EEW(ref="eewTemplate" :map="map",:eew="e")
</template>
