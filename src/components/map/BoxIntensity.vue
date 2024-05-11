<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUpdated } from "vue";
import { useMapStore } from "@/stores/map_store";

const props = defineProps<{
  box: string;
  intensity: number;
}>();

const mapStore = useMapStore();

onMounted(() => {
  if (mapStore.map) {
    console.log("mount", props.box, props.intensity);

    mapStore.map.setFeatureState(
      { source: "box", id: props.box },
      {
        intensity: props.intensity,
      }
    );
  }
});

onUpdated(() => {
  if (mapStore.map) {
    mapStore.map.setFeatureState(
      { source: "box", id: props.box },
      {
        intensity: props.intensity,
      }
    );
  }
});

onBeforeUnmount(() => {
  if (mapStore.map) {
    mapStore.map.removeFeatureState(
      { source: "box", id: props.box },
      "intensity"
    );
  }
});
</script>

<template></template>
