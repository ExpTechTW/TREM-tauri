<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from "vue";
import maplibregl from "maplibre-gl";

const { map, box, int } = defineProps<{
  map: maplibregl.Map;
  box: string;
  int: number;
}>();

onMounted(() => {
  console.log("mount", { box, int });
  map.setFeatureState({ source: "box", id: box }, { int });
});

onUpdated(() => {
  console.log("update", { box, int });

  map.setFeatureState({ source: "box", id: box }, { int });
});

onUnmounted(() => {
  console.log("unmount", { box, int });
  map.removeFeatureState({ source: "box", id: box }, "int");
});
</script>

<template lang="pug"></template>