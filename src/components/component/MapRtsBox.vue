<script setup lang="ts">
import RtsBox from "./RtsBox.vue";

import maplibregl from "maplibre-gl";

import type { Box } from "../../scripts/class/api";
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{
  map: maplibregl.Map;
  box: Box;
}>();

let show = true;
let blink: NodeJS.Timeout;

onMounted(() => {
  props.map.setLayoutProperty("box", "visibility", "visible");
  blink = setInterval(() => {
    props.map.setLayoutProperty("box", "visibility", show ? "none" : "visible");
    show = !show;
  }, 500);
});

onUnmounted(() => {
  props.map.setLayoutProperty("box", "visibility", "none");
  clearInterval(blink);
});
</script>

<template lang="pug">
RtsBox(v-for="(int, key) in box", :key="key", :map="map", :box="key", :int="int")
</template>
