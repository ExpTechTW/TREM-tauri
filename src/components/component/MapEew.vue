<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";
import maplibregl from "maplibre-gl";

import type { Eew } from "../../scripts/class/api";
import EEW from "./EEW.vue";

defineProps<{
  map: maplibregl.Map;
  eew: Ref<Record<string, Eew>>;
}>();

onMounted(() => {});

onUnmounted(() => {});
</script>

<template lang="pug">
template(v-for="e in eew.value" :key="e.id")
  EEW(:map="map",:eew="e")
</template>
