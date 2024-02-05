<script setup lang="ts">
import { onMounted } from "vue";
import maplibregl from "maplibre-gl";

import { TaiwanBounds } from "../../scripts/helper/constant";

const props = defineProps<{
  map: maplibregl.Map;
}>();

onMounted(() => {
  props.map.fitBounds(TaiwanBounds, {
    padding: { top: 16, right: 316, bottom: 16, left: 32 },
    duration: 200,
  });
});
</script>

<template lang="pug"></template>
