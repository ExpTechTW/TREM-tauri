<script setup lang="ts">
import ReportIntensityItem from "./ReportIntensityItem.vue";

import type { AreaIntensity } from "../../scripts/class/api";

defineProps<{ area: AreaIntensity }>();
</script>

<template lang="pug">
.report-intensity-group.expanded
  ReportIntensityItem(:station="{ station: area.area, int: area.int }")
  .report-intensity-member
    ReportIntensityItem(v-for="station in area.stations" :key="station.station" :station="station")
</template>

<style scoped>
.report-intensity-group {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 24px;
  overflow: hidden;
  transition: height 0.2s cubic-bezier(0.2, 0, 0, 1);

  &.expanded {
    height: auto;
    transition-duration: 0.4s;
    transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);

    > .report-intensity-item > .report-intensity-group-collapse {
      scale: 1 -1;
    }
  }

  > .report-intensity-item {
    cursor: pointer;

    > .report-intensity-item-location {
      font-weight: 700;
    }

    > .report-intensity-group-collapse {
      opacity: 0.6;
      transition: scale 0.1s cubic-bezier(0.2, 0, 0, 1);
    }
  }

  > .report-intensity-member {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 24px;

    > .report-intensity-item {
      background-color: hsl(var(--background-hsl));
    }
  }
}
</style>
