<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUpdated } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  code: string;
  int: number;
  override?: number;
}>();

onMounted(() => {
  props.map.setFeatureState(
    { source: "tw_town", id: props.code },
    { int: props.override ?? props.int, override: props.override != undefined }
  );
});

onUpdated(() => {
  props.map.setFeatureState(
    { source: "tw_town", id: props.code },
    { int: props.override ?? props.int, override: props.override != undefined }
  );
});

onBeforeUnmount(() => {
  props.map.removeFeatureState(
    { source: "tw_town", id: props.override ?? props.code },
    "int"
  );
  props.map.removeFeatureState(
    { source: "tw_town", id: props.override ?? props.code },
    "override"
  );
});
</script>

<template lang="pug"></template>
