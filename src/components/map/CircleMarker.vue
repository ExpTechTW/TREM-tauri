<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

import { kmToPixels } from "@/helpers/utils";
import { useMapStore } from "@/stores/map_store";
import { Marker } from "maplibre-gl";

const props = withDefaults(
  defineProps<{
    lnglat: [number, number];
    radius: number;
    opacity?: number;
    zIndex?: number;
  }>(),
  {
    opacity: 1,
    zIndex: 1,
  }
);

const mapStore = useMapStore();
const circleTemplate = ref<HTMLDivElement>();
let circleMarker: Marker;

const radiusInPixel = ref("0px");

let updateLock = false;

const updateCircle = () => {
  if (!mapStore.map || updateLock) {
    return;
  }

  updateLock = true;

  if (props.radius <= 0) {
    radiusInPixel.value = "0px";
    updateLock = false;
    return;
  }

  const newValue = kmToPixels(
    props.radius,
    props.lnglat[1],
    mapStore.map.getZoom()
  );

  if (newValue <= 0) {
    radiusInPixel.value = "0px";
    updateLock = false;
    return;
  }

  radiusInPixel.value = `${newValue * 2}px`;
  updateLock = false;
};

const unwatchRadius = watch(() => props.radius, updateCircle);

const unwatchLngLat = watch(
  () => props.lnglat,
  () => {
    if (circleMarker) circleMarker.setLngLat(props.lnglat);
  }
);

onMounted(() => {
  if (!mapStore.map) return;

  if (circleTemplate.value) {
    circleMarker = new Marker({
      element: circleTemplate.value,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);
  }

  updateCircle();
  mapStore.map.on("move", updateCircle);
});

onBeforeUnmount(() => {
  if (!mapStore.map) return;

  if (circleMarker) {
    circleMarker.remove();
  }

  mapStore.map.off("move", updateCircle);
  unwatchRadius();
  unwatchLngLat();
});
</script>

<template>
  <div ref="circleTemplate" class="circle-marker" :style="{ zIndex }">
    <div
      class="circle"
      :style="{ height: radiusInPixel, width: radiusInPixel }"
    ></div>
  </div>
</template>

<style scoped>
.circle {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  border-radius: 100%;
  translate: -50% -50%;
}
</style>
