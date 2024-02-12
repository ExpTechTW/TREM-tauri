<script setup lang="ts">
import EewIntensity from "./EewIntensity.vue";

import { ref, watch } from "vue";
import maplibregl from "maplibre-gl";

const props = defineProps<{
  map: maplibregl.Map;
  int: Record<string, number>;
  area?: Record<string, string[]>;
}>();

const overrides = ref<Record<string, number>>({});

watch(
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
</script>

<template lang="pug">
template(v-for="(intensity, code) in int" :key="code")
  EewIntensity(:code="code", :int="intensity", :map="map" :override="overrides[code]")
</template>
