<script setup lang="ts">
import EEW from "./EEW.vue";

import { onMounted, onUnmounted, ref } from "vue";
import maplibregl from "maplibre-gl";

import type { EewEvent } from "../../types";
import { ScreenPixelRatio } from "../../scripts/helper/constant";

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

  const initialZoom = props.map.getZoom();

  // FIXME: new algorithm for calculating zoom scale
  const focusEew = () => {
    const bounds = new maplibregl.LngLatBounds();

    for (const id in props.eew) {
      const center = props.map.project([props.eew[id].lng, props.eew[id].lat]);
      const radius =
        (props.eew[id].r.p * 2000) /
        (initialZoom *
          ScreenPixelRatio *
          2 ** (initialZoom - props.map.getZoom()));

      bounds.extend(
        props.map.unproject([center.x - radius, center.y - radius])
      );
      bounds.extend(
        props.map.unproject([center.x + radius, center.y + radius])
      );
    }

    props.map.fitBounds(bounds, {
      padding: { top: 0, right: 320, bottom: 0, left: 0 },
      maxZoom: 8.25,
    });
  };

  focusEew();

  intervals.focus = setInterval(focusEew, 5_000);
});

onUnmounted(() => {
  clearInterval(intervals.wave);
  clearInterval(intervals.cross);
  clearInterval(intervals.focus);

  props.map.setLayoutProperty("county", "visibility", "visible");
  props.map.setLayoutProperty("town", "visibility", "none");
});
</script>

<template lang="pug">
template(v-for="e in eew" :key="e.id")
  EEW(ref="eewTemplate" :map="map",:eew="e")
</template>
