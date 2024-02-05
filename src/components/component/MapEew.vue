<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import maplibregl from "maplibre-gl";

import EEW from "./EEW.vue";
import type { EewEvent } from "../../types";

defineProps<{
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
});

onUnmounted(() => {
  clearInterval(intervals.wave);
  clearInterval(intervals.cross);
});
</script>

<template lang="pug">
template(v-for="e in eew" :key="e.id")
  EEW(ref="eewTemplate" :map="map",:eew="e")
</template>
