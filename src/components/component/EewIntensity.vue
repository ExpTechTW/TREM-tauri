<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  code: string;
  int: number;
}>();

onMounted(() => {
  props.map.setFeatureState(
    { source: "tw_town", id: props.code },
    { int: props.int }
  );
});

onUnmounted(() => {
  props.map.removeFeatureState({ source: "tw_town", id: props.code }, "int");
});
</script>

<template lang="pug"></template>
