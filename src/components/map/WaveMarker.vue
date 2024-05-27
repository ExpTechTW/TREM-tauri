<script setup lang="ts">
import CircleMarker from "@/components/map/CircleMarker.vue";

defineProps<{
  type: "s" | "p";
  radius: number;
  lnglat: [number, number];
  alert: boolean;
  zIndex?: number;
}>();
</script>

<template>
  <CircleMarker
    class="circle-marker-stroke"
    :class="{ [type]: true, alert }"
    :radius="radius"
    :lnglat="lnglat"
    :z-index="zIndex"
    :stroke="3"
    :stroke-color="type == 'p' ? '#6bf' : alert ? '#f22' : '#ffa500'"
  />
  <CircleMarker
    v-if="type == 's'"
    class="circle-marker-background"
    :class="{ [type]: true, alert }"
    :radius="radius"
    :lnglat="lnglat"
    :z-index="-1"
    :opacity="0.4"
    :fill-color="`radial-gradient(transparent 40%, ${
      alert ? '#f22' : '#ffa500'
    })`"
  />
</template>
