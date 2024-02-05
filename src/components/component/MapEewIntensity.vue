<script setup lang="ts">
import EewIntensity from "./EewIntensity.vue";

import maplibregl from "maplibre-gl";

defineProps<{
  map: maplibregl.Map;
  int: Record<string, number>;
}>();
</script>

<template lang="pug">
template(v-for="(intensity, code) in int" :key="code")
  EewIntensity(:code="code", :int="intensity", :map="map")
</template>
