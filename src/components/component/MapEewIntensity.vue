<script setup lang="ts">
import EewIntensity from "./EewIntensity.vue";

import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  int: Record<string, number>;
  area?: Record<string, string[]>;
}>();

const overrides = ref<Record<string, number>>({});

const unwatch = watch(
  () => props.area,
  () => {
    const newOverrides: Record<string, number> = {};
    for (const int in props.area) {
      for (const code of props.area[int]) {
        newOverrides[code] = +int;
      }
    }
    overrides.value = newOverrides;
  }
);

onMounted(() => {
  props.map.setLayoutProperty("town", "visibility", "visible");
  props.map.setLayoutProperty("county", "visibility", "none");
});

onBeforeUnmount(() => {
  props.map.setLayoutProperty("county", "visibility", "visible");
  props.map.setLayoutProperty("town", "visibility", "none");
  unwatch();
});
</script>

<template lang="pug">
template(v-for="(intensity, code) in int" :key="code")
  EewIntensity(:code="code", :int="overrides[code]??intensity", :map="map", :override="overrides[code]")
</template>
