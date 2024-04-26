<script setup lang="ts">
import { useMapStore } from "@/stores/map_store";
import { Marker, type LngLatLike } from "maplibre-gl";
import { ComponentPublicInstance, onMounted, onUnmounted, ref } from "vue";
import IntensityBlock from "../misc/IntensityBlock.vue";

const props = withDefaults(
  defineProps<{
    intensity: number;
    lnglat: LngLatLike;
    size?: number;
    zIndex?: number;
  }>(),
  {
    size: 20,
    zIndex: 1,
  }
);

const mapStore = useMapStore();
const markerElement = ref<ComponentPublicInstance>();
let marker: Marker;

onMounted(() => {
  if (mapStore.map) {
    marker = new Marker({
      element: markerElement.value?.$el,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);
  }
});

onUnmounted(() => {
  if (marker) {
    marker.remove();
  }
});
</script>

<template>
  <IntensityBlock
    ref="markerElement"
    :intensity="intensity"
    :size="size"
    :style="{ zIndex }"
  />
</template>
