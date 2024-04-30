<script setup lang="ts">
import CircleMarker from "@/components/map/CircleMarker.vue";
import CrossMarker from "@/components/map/CrossMarker.vue";
import DotMarker from "@/components/map/DotMarker.vue";

import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import type { EewEvent } from "../../types";
import { EewStatus } from "@exptechtw/api-wrapper";
import { getMarkerSizeOnZoom } from "@/helpers/utils";
import { useMapStore } from "@/stores/map_store";

defineProps<{
  eew: EewEvent;
}>();

const mapStore = useMapStore();

const markerSize = computed(() => {
  if (!mapStore.value) return 16;

  return getMarkerSizeOnZoom(mapStore.value.getZoom());
});

const markerOpacity = ref(1);
let flashTimer: number | null = null;

const flashMarkers = (state: boolean) => {
  markerOpacity.value = state ? 1 : 0;
};

/* 
const unwatchTemplate = watch(
  () => crossTemplate.value,
  () => {
    if (marker) {
      marker.remove();
    }

    marker = new Marker({
      element: crossTemplate.value?.$el,
    })
      .setLngLat([props.eew.lng, props.eew.lat])
      .addTo(props.map);
  }
);
 */

onMounted(() => {
  flashTimer = window.setInterval(flashMarkers, 700);
});

onBeforeUnmount(() => {
  if (flashTimer) {
    window.clearInterval(flashTimer);
  }
  /* unwatchTemplate(); */
});
</script>

<template>
  <CrossMarker
    v-if="eew.detail"
    :lnglat="[eew.lng, eew.lat]"
    :class="{ cancelled: eew.cancel }"
    :size="markerSize"
    :opacity="markerOpacity"
    :z-index="1000"
  />
  <DotMarker
    v-else
    :class="{ cancelled: eew.cancel }"
    :lnglat="[eew.lng, eew.lat]"
    :size="markerSize"
    :opacity="markerOpacity"
    :intensity="eew.max"
    :z-index="1000"
  />
  <CircleMarker
    v-if="eew.detail && !eew.cancel"
    type="s"
    :radius="eew.r.s"
    :lnglat="[eew.lng, eew.lat]"
    :alert="eew.status == EewStatus.Alert"
    :z-index="1000"
  />
  <CircleMarker
    v-if="eew.detail && !eew.cancel"
    type="p"
    :radius="eew.r.p"
    :lnglat="[eew.lng, eew.lat]"
    :alert="eew.status == EewStatus.Alert"
    :z-index="1000"
  />
</template>

<style lang="scss">
.cancelled {
  opacity: 0.6 !important;
  filter: saturate(0);
}
</style>
