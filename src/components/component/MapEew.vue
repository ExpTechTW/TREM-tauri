<script setup lang="ts">
import EEW from "./EEW.vue";

import { onMounted, onUnmounted, ref } from "vue";
import maplibregl from "maplibre-gl";

import type { EewEvent } from "../../types";
import { kmToPixels } from "../../scripts/helper/utils";

const props = defineProps<{
  map: maplibregl.Map;
  eew: Record<string, EewEvent>;
}>();

const eewTemplate = ref<InstanceType<typeof EEW>[]>([]);
let intervals: Record<string, number> = {};

onMounted(() => {
  let crossState = true;

  intervals.cross = window.setInterval(() => {
    crossState = !crossState;
    for (const eew of eewTemplate.value) {
      eew.redrawCross(crossState);
    }
  }, 500);

  props.map.setLayoutProperty("town", "visibility", "visible");
  props.map.setLayoutProperty("county", "visibility", "none");

  // FIXME: new algorithm for calculating zoom scale
  const focusEew = () => {
    const bounds = new maplibregl.LngLatBounds();
    const zoom = props.map.getZoom();

    for (const id in props.eew) {
      if (!props.eew[id].detail) {
        bounds.extend([props.eew[id].lng, props.eew[id].lat]);
        continue;
      }

      const center = props.map.project([props.eew[id].lng, props.eew[id].lat]);
      const radius = kmToPixels(props.eew[id].r.p, props.eew[id].lat, zoom);

      bounds.extend(
        props.map.unproject([center.x - radius, center.y - radius])
      );
      bounds.extend(
        props.map.unproject([center.x + radius, center.y + radius])
      );
    }

    props.map.fitBounds(bounds, {
      padding: { top: 0, right: 320, bottom: 0, left: 0 },
      maxZoom: 8,
    });
  };

  focusEew();

  intervals.focus = window.setInterval(focusEew, 5_000);
});

onUnmounted(() => {
  window.clearInterval(intervals.wave);
  window.clearInterval(intervals.cross);
  window.clearInterval(intervals.focus);

  props.map.setLayoutProperty("county", "visibility", "visible");
  props.map.setLayoutProperty("town", "visibility", "none");
});
</script>

<template lang="pug">
template(v-for="e in eew" :key="e.id")
  EEW(ref="eewTemplate" :map="map",:eew="e")
</template>
