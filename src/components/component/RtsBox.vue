<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUpdated } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  box: string;
  int: number;
}>();

onMounted(() => {
  props.map.setFeatureState(
    { source: "box", id: props.box },
    { int: props.int }
  );
});

onUpdated(() => {
  props.map.setFeatureState(
    { source: "box", id: props.box },
    { int: props.int }
  );
});

onBeforeUnmount(() => {
  props.map.removeFeatureState({ source: "box", id: props.box }, "int");
});
</script>

<template lang="pug"></template>
