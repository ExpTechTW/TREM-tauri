<script setup lang="ts">
import CircleMarker from "./CircleMarker.vue";
import CrossMarker from "./CrossMarker.vue";
import DotMarker from "./DotMarker.vue";

import type { ComponentPublicInstance } from "vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import maplibregl from "maplibre-gl";

import type { EewEvent } from "../../types";
import { EewStatus } from "../../scripts/class/api";
import { getMarkerSizeOnZoom } from "../../scripts/helper/utils";

const props = defineProps<{
  map: maplibregl.Map;
  eew: EewEvent;
}>();

let marker: maplibregl.Marker;
const markerSize = ref(getMarkerSizeOnZoom(props.map.getZoom()));
const crossTemplate = ref<ComponentPublicInstance<typeof CrossMarker>>();

const updateCrossFlash = (state: boolean) => {
  marker.setOpacity(state ? "1" : "0");
};

const scaleMarker = () => {
  markerSize.value = getMarkerSizeOnZoom(props.map.getZoom());
};

defineExpose({
  redrawCross(crossState: boolean) {
    updateCrossFlash(crossState);
  },
});

const unwatchLngLat = watch(
  () => [props.eew.lng, props.eew.lat],
  () => {
    marker.setLngLat([props.eew.lng, props.eew.lat]);
  }
);

const unwatchTemplate = watch(
  () => crossTemplate.value,
  () => {
    if (marker) {
      marker.remove();
    }

    marker = new maplibregl.Marker({
      element: crossTemplate.value?.$el,
    })
      .setLngLat([props.eew.lng, props.eew.lat])
      .addTo(props.map);
  }
);

onMounted(() => {
  marker = new maplibregl.Marker({
    element: crossTemplate.value?.$el,
  })
    .setLngLat([props.eew.lng, props.eew.lat])
    .addTo(props.map);

  props.map.on("zoom", scaleMarker);
});

onBeforeUnmount(() => {
  marker.remove();
  props.map.off("zoom", scaleMarker);
  unwatchLngLat();
  unwatchTemplate();
});
</script>

<template lang="pug">
CrossMarker(v-if="eew.detail", ref="crossTemplate", :class="{ cancelled: eew.cancel }" :map="map", :size="markerSize", :z-index="1000")
DotMarker(v-else, ref="crossTemplate", :class="{ cancelled: eew.cancel }" :map="map", :size="markerSize", :int="eew.max", :z-index="1000")
CircleMarker(v-if="eew.detail && !eew.cancel" ,:map="map", type="s", :radius="eew.r.s", :lng="eew.lng", :lat="eew.lat", :alert="eew.status == EewStatus.Alert", :z-index="1000")
CircleMarker(v-if="eew.detail && !eew.cancel" :map="map", type="p", :radius="eew.r.p", :lng="eew.lng", :lat="eew.lat", :alert="eew.status == EewStatus.Alert", :z-index="1000")
</template>

<style lang="scss">
.cancelled {
  opacity: 0.6 !important;
  filter: saturate(0);
}
</style>
