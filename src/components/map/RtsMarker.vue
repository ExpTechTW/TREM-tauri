<script setup lang="ts">
import { RtsStation } from "#/@exptechtw/api-wrapper/dist/types";
import { useMapStore } from "@/stores/map_store";
import { Marker, type LngLatLike } from "maplibre-gl";
import { onMounted, onUnmounted, ref } from "vue";
import { scale } from "chroma-js";

const i = scale([
  "#0500A3",
  "#00ceff",
  "#33ff34",
  "#fdff32",
  "#ff8532",
  "#fc5235",
  "#c03e3c",
  "#9b4544",
  "#9a4c86",
  "#b720e9",
]).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const props = withDefaults(
  defineProps<{
    lnglat: LngLatLike;
    rts?: RtsStation;
    alert?: boolean;
  }>(),
  {
    alert: false,
    zIndex: 1,
  }
);

const mapStore = useMapStore();
const markerElement = ref<HTMLDivElement>();
let marker: Marker;

onMounted(() => {
  if (mapStore.map) {
    marker = new Marker({
      element: markerElement.value,
    })
      .setLngLat(props.lnglat)
      .addTo(mapStore.map);
  }
});

onUnmounted(() => {
  if (marker) {
    marker.remove();
  }
});
</script>

<template>
  <div
    ref="markerElement"
    class="rts-marker"
    :style="{
      backgroundColor: rts ? i(rts.i).hex() : '',
      zIndex: rts ? rts.i + 10 : 1,
    }"
  ></div>
</template>

<style scoped>
.rts-marker {
  height: 8px;
  width: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 64px;
  font-weight: 600;
  border: 1px solid var(--p-surface-500);
}
</style>
