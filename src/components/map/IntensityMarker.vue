<script setup lang="ts">
import { useMapStore } from "@/stores/map_store";
import { Marker, type LngLatLike } from "maplibre-gl";
import { onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    intensity: number;
    lnglat: LngLatLike;
    size?: number;
    zIndex?: number;
  }>(),
  {
    size: 20,
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
    class="intensity-marker"
    :class="[`intensity-${intensity}`]"
    :style="{
      height: `${size}px`,
      width: `${size}px`,
      fontSize: `${(size / 3) * 2}px`,
      zIndex,
    }"
  >
    {{ ["0", "1", "2", "3", "4", "5⁻", "5⁺", "6⁻", "6⁺", "7"][intensity] }}
  </div>
</template>

<style scoped>
.intensity-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 600;
  letter-spacing: -1px;
  border: 2px solid #fff;
}
</style>
