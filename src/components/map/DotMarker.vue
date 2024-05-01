<script setup lang="ts">
import { useMapStore } from "@/stores/map_store";
import { LngLatLike, Marker } from "maplibre-gl";
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    lnglat: LngLatLike;
    intensity?: number;
    size?: number;
    opacity?: number;
    zIndex?: number;
  }>(),
  {
    size: 28,
    zIndex: 10,
    opacity: 1,
  }
);

const mapStore = useMapStore();
const markerElement = ref<HTMLDivElement>();
let marker: Marker;

const unwatchLngLat = watch(
  () => props.lnglat,
  () => {
    if (marker) marker.setLngLat(props.lnglat);
  }
);

const unwatchOpacity = watch(
  () => props.opacity,
  () => {
    if (marker) marker.setOpacity(`${props.opacity}`);
  }
);

onMounted(() => {
  if (mapStore.map) {
    marker = new Marker({
      element: markerElement.value,
      opacity: `${props.opacity}`,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);
  }
});

onUnmounted(() => {
  if (marker) {
    marker.remove();
  }
  unwatchLngLat();
  unwatchOpacity();
});
</script>

<template>
  <div
    ref="markerElement"
    class="dot-marker"
    :style="{ height: `${size}px`, width: `${size}px`, zIndex }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 76 76"
      :class="
        intensity != undefined ? `intensity-${intensity}` : 'intensity-unknown'
      "
      :height="size"
      :width="size"
    >
      <circle class="outer" cx="38" cy="38" r="28" />
      <circle class="inner" cx="38" cy="38" r="20" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.dot-marker {
  transition: opacity 0s;
  z-index: 100;
}

svg {
  background-color: transparent;
}
</style>
