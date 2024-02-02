<script setup lang="ts">
import { markRaw, onMounted, onUnmounted, shallowRef } from 'vue';
import mapstyle from "../assets/json/style.json";
import maplibregl from "maplibre-gl";

const map = shallowRef<maplibregl.Map | null>(null);

onMounted(() => {
  const initialState = { lng: 120.5, lat: 23.6, zoom: 6.75 };

  map.value = markRaw(new maplibregl.Map({
    container: "map",
    style: mapstyle,
    center: [initialState.lng, initialState.lat],
    zoom: initialState.zoom
  }))
  
  map.value.on("load",() =>{
    if (!map.value) return;

    map.value.addLayer({
      id     : "county",
      type   : "fill",
      source : "tw_county",
      layout : {},
      paint  : {
        "fill-color"   : "#43474e",
        "fill-opacity" : 1
      }
    })
    .addLayer({
      id     : "county_outline",
      type   : "line",
      source : "tw_county",
      layout : {},
      paint  : {
        "line-color"   : "#bcc7db",
        "line-opacity" : 1,
        "line-width"   : 0.6
      }
    });
  })
}),

onUnmounted(() => {
  map.value?.remove();
})
</script>

<template lang="pug">
#map.map-container
</template>

<style scoped>
.map-container {
  position: absolute;
  inset: 0;
  height: 100svh;
  width: 100svw;
}
</style>
