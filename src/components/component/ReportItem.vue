<script setup lang="ts">
import IntensityBox from "./IntensityBox.vue";

import type { PartialReport } from "../../scripts/class/api";
import {
  extractLocationFromString,
  toFormattedTimeString,
} from "../../scripts/helper/utils";

defineProps<{
  report: PartialReport;
  changeReport(report: PartialReport): void;
}>();
</script>

<template lang="pug">
.report-list-item(:class="{numbered: report.no % 1000}", @click="changeReport(report)")
  IntensityBox(:int="report.int")
  .report-list-item-content
    span.report-list-item-location {{ extractLocationFromString(report.loc) }}
    span.report-list-item-time {{ toFormattedTimeString(report.time) }}
  .report-list-item-magnitude {{ report.mag.toFixed(1) }}
</template>

<style lang="scss" scoped>
.report-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  border-radius: 11px;
  background-color: hsl(var(--surface-variant-hsl));
  color: #fff;
  font-size: 16px;
  margin: 1px;
  outline: transparent;
  box-shadow: transparent;
  opacity: 0.85;
  cursor: pointer;

  transition:
    background-color 0.1s ease-in-out,
    opacity 0.1s ease-in-out,
    outline 0.1s ease-in-out,
    box-shadow 0.1s ease-in-out;

  > .intensity-box {
    height: 44px;
    font-size: 28px;
    line-height: 28px;
    font-weight: 700;
  }

  > .report-list-item-content {
    display: flex;
    flex-direction: column;
    flex: 1;

    > .report-list-item-location {
      font-weight: 500;
    }

    > .report-list-item-time {
      font-size: 75%;
      font-variant-numeric: tabular-nums;
    }
  }

  > .report-list-item-magnitude {
    padding-right: 12px;
    font-size: 18px;
    font-variant-numeric: tabular-nums;

    &::before {
      content: "M";
      margin-right: 4px;
      font-size: 75%;
    }
  }

  &.numbered {
    > .report-list-item-magnitude {
      color: hsl(51deg 100% 60%);
    }
  }

  &:hover {
    opacity: 1;
    outline: 1px solid hsl(0deg 0% 75%);
    box-shadow: 0 0 6px 0 hsl(0deg 0% 75%);
  }

  &:active {
    background-color: hsl(var(--surface-variant-hsl));
  }
}
</style>
