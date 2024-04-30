<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";

import { kmToPixels } from "@/helpers/utils";
import { useMapStore } from "@/stores/map_store";
import { Marker } from "maplibre-gl";

const props = defineProps<{
  type: "s" | "p";
  radius: number;
  lnglat: [number, number];
  alert: boolean;
  zIndex: number;
}>();

const mapStore = useMapStore();
const strokeTemplate = ref<HTMLDivElement>();
const backgroundTemplate = ref<HTMLDivElement>();
let strokeMarker: Marker;
let backgroundMarker: Marker;

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

const unwatch = watch(() => props.radius, updateCircle);

onMounted(() => {
  if (!mapStore.map) return;

  if (strokeTemplate.value) {
    strokeMarker = new Marker({
      element: strokeTemplate.value,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);
  }

  if (backgroundTemplate.value) {
    backgroundMarker = new Marker({
      element: backgroundTemplate.value,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);
  }

  mapStore.map.on("move", updateCircle);
});

onBeforeUnmount(() => {
  if (!mapStore.map) return;

  if (strokeMarker) {
    strokeMarker.remove();
  }

  if (backgroundMarker) {
    backgroundMarker.remove();
  }

  mapStore.map.off("move", updateCircle);
  unwatch();
});
</script>

<template>
  <div ref="strokeTemplate">
    <div
      class="circle circle-marker-stroke"
      :class="{ [type]: true, alert }"
      :style="{ height: radiusInPixel, width: radiusInPixel }"
    ></div>
  </div>
  <div ref="backgroundTemplate">
    <div
      class="circle circle-marker-background"
      :class="{ [type]: true, alert }"
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

.circle-marker-stroke {
  border: 3px solid transparent;
  border-radius: 100%;

  &.p {
    border-color: #6bf;
  }

  &.s:not(.alert) {
    border-color: #ffa500;
  }

  &.s.alert {
    border-color: #f22;
  }
}

.circle-marker-stroke {
  border: 3px solid transparent;

  &.p {
    border-color: #6bf;
  }

  &.s:not(.alert) {
    border-color: #ffa500;
  }

  &.s.alert {
    border-color: #f22;
  }
}

.circle-marker-background {
  opacity: 0.4;

  &.s:not(.alert) {
    background: radial-gradient(transparent 40%, #ffa500);
  }

  &.s.alert {
    border-color: radial-gradient(transparent 40%, #f22);
  }
}
</style>
