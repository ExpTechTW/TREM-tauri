<script setup lang="ts">
import { onMounted, onUnmounted, ref, type Ref } from "vue";
import maplibregl from "maplibre-gl";

import type { Eew } from "../../scripts/class/api";
import EEW from "./EEW.vue";

defineProps<{
  map: maplibregl.Map;
  eew: Ref<Record<string, Eew>>;
}>();

const eewTemplate = ref<InstanceType<typeof EEW>[]>([]);
let intervals: Record<string, NodeJS.Timeout> = {};

onMounted(() => {
  let crossState = true;

  intervals.wave = setInterval(() => {
    for (const eew of eewTemplate.value) {
      eew.redrawWave();
    }
  }, 100);

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
template(v-for="e in eew.value" :key="e.id")
  EEW(ref="eewTemplate" :map="map",:eew="e")
</template>
