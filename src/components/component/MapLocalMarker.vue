<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  lat: number;
  lng: number;
}>();

let marker: maplibregl.Marker;
const markerTemplate = ref<HTMLDivElement>();

onMounted(() => {
  marker = new maplibregl.Marker({ element: markerTemplate.value })
    .setLngLat([props.lng, props.lat])
    .addTo(props.map);
});

onBeforeUnmount(() => {
  marker.remove();
});
</script>

<template lang="pug">
.local-marker.material-symbols-rounded(ref="markerTemplate") my_location
</template>

<style lang="scss">
.local-marker {
  z-index: 5000;
  color: hsl(180deg 40% 67%);
}
</style>
