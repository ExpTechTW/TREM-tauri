<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import maplibregl from "maplibre-gl";

import { kmToPixels } from "../../scripts/helper/utils";

const props = defineProps<{
  map: maplibregl.Map;
  type: "s" | "p";
  radius: number;
  lng: number;
  lat: number;
  alert: boolean;
  zIndex: number;
}>();

const strokeTemplate = ref<SVGElement>();
const backgroundTemplate = ref<SVGElement>();
const lnglatInPixel = ref(props.map.project([props.lng, props.lat]));
const radiusInPixel = ref(0);

let updateLock = false;

const updateCircle = () => {
  if (updateLock) return;
  updateLock = true;

  if (props.radius <= 0) {
    radiusInPixel.value = 0;
    updateLock = false;
    return;
  }

  lnglatInPixel.value = props.map.project([props.lng, props.lat]);

  const newValue = kmToPixels(props.radius, props.lat, props.map.getZoom());

  if (newValue <= 0) {
    radiusInPixel.value = 0;
    updateLock = false;
    return;
  }

  radiusInPixel.value = newValue;
  updateLock = false;
};

watch(() => props.radius, updateCircle);

props.map.on("move", updateCircle);

onMounted(() => {
  if (strokeTemplate.value)
    props.map.getCanvasContainer().append(strokeTemplate.value);
  if (backgroundTemplate.value)
    props.map.getCanvasContainer().prepend(backgroundTemplate.value);
});

onBeforeUnmount(() => {
  if (strokeTemplate.value) strokeTemplate.value.remove();
  if (backgroundTemplate.value) backgroundTemplate.value.remove();

  props.map.off("move", updateCircle);
});
</script>

<template lang="pug">
svg.circle(ref="strokeTemplate", xmlns="http://www.w3.org/2000/svg", :class="`wave-${type} ${alert ? 'alert' : ''}`", :style="{ zIndex }")
  circle.stroke(:cx="lnglatInPixel.x", :cy="lnglatInPixel.y", :r="radiusInPixel")
svg.circle(v-if="type != 'p'", ref="backgroundTemplate", xmlns="http://www.w3.org/2000/svg", :class="`wave-${type} ${alert ? 'alert' : ''}`")
  circle.background(:cx="lnglatInPixel.x", :cy="lnglatInPixel.y", :r="radiusInPixel")
</template>

<style>
.circle {
  position: absolute;
  pointer-events: none;
  height: 100%;
  width: 100%;

  .stroke {
    stroke-width: 2px;
  }

  &.wave-p > .stroke {
    fill: transparent;
    stroke: #6bf;
  }

  &.wave-s:not(.alert) {
    > .stroke {
      fill: transparent;
      stroke: #ffa500;
    }

    > .background {
      fill: url(#warn-gradient);
    }
  }

  &.wave-s.alert {
    > .stroke {
      fill: transparent;
      stroke: #f22;
    }

    > .background {
      fill: url(#alert-gradient);
    }
  }
}
</style>
