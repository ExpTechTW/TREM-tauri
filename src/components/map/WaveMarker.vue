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
  />
  <CircleMarker
    v-if="type == 's'"
    class="circle-marker-background"
    :class="{ [type]: true, alert }"
    :radius="radius"
    :lnglat="lnglat"
    :z-index="-1"
  />
</template>

<style scoped>
.circle {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  border-radius: 100%;
  translate: -50% -50%;
}

.circle-marker-stroke:deep(.circle) {
  border: 3px solid transparent;
  border-radius: 100%;
}

.circle-marker-stroke.p:deep(.circle) {
  border-color: #6bf;
}

.circle-marker-stroke.s:not(.alert):deep(.circle) {
  border-color: #ffa500;
}

.circle-marker-stroke.s.alert:deep(.circle) {
  border-color: #f22;
}

.circle-marker-background:deep(.circle) {
  opacity: 0.4;
}

.circle-marker-background.s:not(.alert):deep(.circle) {
  background: radial-gradient(transparent 40%, #ffa500);
}

.circle-marker-background.s.alert:deep(.circle) {
  background: radial-gradient(transparent 40%, #f22);
}
</style>
