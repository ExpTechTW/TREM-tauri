<script setup lang="ts">
import IntensityCapsule from "./IntensityCapsule.vue";

defineProps<{
  area?: string;
  station: string;
  int: number;
}>();
</script>

<template lang="pug">
.report-intensity-item
  IntensityCapsule(:int="int")
  span.location.area(v-if="area") {{ area }}
  span.location.station(v-if="station") {{ station }}
</template>

<style lang="scss" scoped>
.report-intensity-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
  border-radius: 24px;
  background-color: hsl(var(--background-variant-hsl));

  > .report-intensity-item-intensity {
    height: 24px;
    width: 44px;
    border-radius: 24px;
    line-height: 24px;
    font-family: "Open Sans", "Lato", "Noto Sans TC", sans-serif;
    font-size: 22px;
    font-weight: 900;
    text-align: center;
  }

  &.collapsible > .area {
    flex: 1;
  }

  &:has(> .area + .station) > .area {
    font-weight: 700;
  }

  > .location {
    font-size: 13px;
  }

  > .collapse-icon {
    width: 16px;
    aspect-ratio: 1;
    font-size: 16px;
    opacity: 0.6;
  }
}
</style>
