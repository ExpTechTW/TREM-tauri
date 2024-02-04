<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  box: string;
  int: number;
}>();

onMounted(() => {
  console.log("mount", { box: props.box, int: props.int });
  props.map.setFeatureState(
    { source: "box", id: props.box },
    { int: props.int }
  );
});

onUpdated(() => {
  console.log("update", { box: props.box, int: props.int });

  props.map.setFeatureState(
    { source: "box", id: props.box },
    { int: props.int }
  );
});

onUnmounted(() => {
  console.log("unmount", { box: props.box, int: props.int });
  props.map.removeFeatureState({ source: "box", id: props.box }, "int");
});
</script>

<template lang="pug"></template>
