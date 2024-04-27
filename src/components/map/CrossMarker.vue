<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Marker, type LngLatLike } from "maplibre-gl";
import { useMapStore } from "@/stores/map_store";

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
  unwatchOpacity();
});
</script>

<template>
  <div
    ref="markerElement"
    class="cross-marker"
    :style="{ height: `${size}px`, width: `${size}px`, zIndex }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 76 76"
      :class="intensity ? `intensity-${intensity}` : 'red-cross'"
      :height="size"
      :width="size"
    >
      <path
        class="inner"
        d="M59 73a3 3 0 0 1-2-1L38 53 19 72a3 3 0 0 1-4 0L4 61a3 3 0 0 1 0-4l19-19L4 19a3 3 0 0 1 0-4L15 4a3 3 0 0 1 4 0l19 19L57 4a3 3 0 0 1 2-1 3 3 0 0 1 2 1l11 11a3 3 0 0 1 0 4L53 38l19 19a3 3 0 0 1 0 4L61 72a3 3 0 0 1-2 1Z"
      />
      <path
        class="outer"
        d="m59 6 11 11-21 21 21 21-11 11-21-21-21 21L6 59l21-21L6 17 17 6l21 21L59 6m0-6a6 6 0 0 0-4 2L38 19 21 2a6 6 0 0 0-4-2 6 6 0 0 0-5 2L2 12a6 6 0 0 0 0 9l17 17L2 55a6 6 0 0 0 0 9l10 10a6 6 0 0 0 9 0l17-17 17 17a6 6 0 0 0 9 0l10-10a6 6 0 0 0 0-9L57 38l17-17a6 6 0 0 0 0-9L64 2a6 6 0 0 0-5-2Z"
      />
    </svg>
  </div>
</template>

<style scoped>
.cross-marker {
  transition: opacity 0s;
  z-index: 100;
}
.red-cross .inner {
  fill: #f22;
}

.red-cross .outer {
  fill: #fff;
}

svg {
  background-color: transparent;
}
</style>
