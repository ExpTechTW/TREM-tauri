<script setup lang="ts">
import RtsBox from "./RtsBox.vue";

import maplibregl from "maplibre-gl";

import type { Box } from "../../scripts/class/api";
import { onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  map: maplibregl.Map;
  box: Box;
}>();

let show = true;
let blink: number;

onMounted(() => {
  props.map.setLayoutProperty("box", "visibility", "visible");
  blink = window.setInterval(() => {
    props.map.setLayoutProperty("box", "visibility", show ? "none" : "visible");
    show = !show;
  }, 500);
});

onBeforeUnmount(() => {
  props.map.setLayoutProperty("box", "visibility", "none");
  window.clearInterval(blink);
});

function filter(box: Box) {
  return box;
}
</script>

<template lang="pug">
RtsBox(v-for="(int, key) in filter(box)", :key="key", :map="map", :box="key", :int="int")
</template>
