<script setup lang="ts">
import { onMounted } from "vue";
import maplibregl from "maplibre-gl";

import { TaiwanBounds } from "../../scripts/helper/constant";

const { map } = defineProps<{
  map: maplibregl.Map;
}>();

onMounted(() => {
  map.fitBounds(TaiwanBounds, {
    padding: { top: 16, right: 16, bottom: 16, left: 32, },
    duration: 300,
  });
});
</script>

<template lang="pug"></template>