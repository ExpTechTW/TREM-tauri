<script setup lang="ts">
import CircleMarker from "./CircleMarker.vue";
import CrossMarker from "./CrossMarker.vue";

import type { ComponentPublicInstance } from "vue";
import { onMounted, onUnmounted, ref, watch } from "vue";
import maplibregl from "maplibre-gl";

import { EewStatus } from "../../scripts/class/api";
import type { EewEvent } from "../../types";

const props = defineProps<{
  map: maplibregl.Map;
  eew: EewEvent;
}>();

let marker: maplibregl.Marker;
const crossTemplate = ref<ComponentPublicInstance<typeof CrossMarker>>();

const updateCrossFlash = (state: boolean) => {
  marker.setOpacity(state ? "1" : "0");
};

defineExpose({
  redrawCross(crossState: boolean) {
    updateCrossFlash(crossState);
  },
});

watch(
  () => [props.eew.lng, props.eew.lat],
  () => {
    marker.setLngLat([props.eew.lng, props.eew.lat]);
  }
);

onMounted(() => {
  marker = new maplibregl.Marker({
    element: crossTemplate.value?.$el,
  })
    .setLngLat([props.eew.lng, props.eew.lat])
    .addTo(props.map);
});

onUnmounted(() => {
  marker.remove();
});
</script>

<template lang="pug">
CrossMarker(ref="crossTemplate", :map="map", :size="28", :z-index="1000")
CircleMarker(:map="map", type="s", :radius="props.eew.r.s", :lng="props.eew.lng", :lat="props.eew.lat", :alert="props.eew.status == EewStatus.Alert", :z-index="1000")
CircleMarker(:map="map", type="p", :radius="props.eew.r.p", :lng="props.eew.lng", :lat="props.eew.lat", :alert="props.eew.status == EewStatus.Alert", :z-index="1000")
</template>
