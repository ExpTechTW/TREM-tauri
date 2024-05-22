<script setup lang="ts">
import CrossMarker from "@/components/map/CrossMarker.vue";
import DotMarker from "@/components/map/DotMarker.vue";
import WaveMarker from "./WaveMarker.vue";

import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import { EewSource, EewStatus, EewType } from "@exptechtw/api-wrapper";
import { calculateWaveRadius, getMarkerSizeOnZoom } from "@/helpers/utils";
import { useMapStore } from "@/stores/map_store";

const props = defineProps<{
  eew: EewType;
  time: number;
}>();

const mapStore = useMapStore();

const markerSize = computed(() => {
  if (!mapStore.value) return 16;

  return getMarkerSizeOnZoom(mapStore.value.getZoom());
});

const markerOpacity = ref(1);
let flashState = true;
let flashTimer: number | null = null;

const flashMarkers = () => {
  flashState = !flashState;
  markerOpacity.value = flashState ? 1 : 0;
};

const waveRadius = computed(() =>
  calculateWaveRadius(props.time, props.eew.eq.depth, props.eew.eq.time)
);

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
    v-if="eew.author != EewSource.Trem || eew.detail"
    :lnglat="[eew.eq.lon, eew.eq.lat]"
    :size="markerSize"
    :opacity="eew.status == EewStatus.Cancel ? 0.4 : markerOpacity"
    :z-index="1000"
  />
  <DotMarker
    v-else
    :class="{ cancelled: eew.status == EewStatus.Cancel }"
    :lnglat="[eew.eq.lon, eew.eq.lat]"
    :size="markerSize"
    :opacity="markerOpacity"
    :intensity="eew.eq.max"
    :z-index="1000"
  />
  <WaveMarker
    v-if="
      (eew.author != EewSource.Trem || eew.detail) &&
      eew.status != EewStatus.Cancel
    "
    type="p"
    :lnglat="[eew.eq.lon, eew.eq.lat]"
    :radius="waveRadius.p"
    :alert="eew.status == EewStatus.Alert"
  />
  <WaveMarker
    v-if="
      (eew.author != EewSource.Trem || eew.detail) &&
      eew.status != EewStatus.Cancel
    "
    type="s"
    :lnglat="[eew.eq.lon, eew.eq.lat]"
    :radius="waveRadius.s"
    :alert="eew.status == EewStatus.Alert"
  />
</template>

<style lang="scss">
.cancelled {
  opacity: 0.6 !important;
  filter: saturate(0);
}
</style>
