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
.detailed-report-list-item(@click="changeReport(report)")
  .intensity-container
    IntensityBox(:int="report.int")
    .intensity-description 最大觀測震度
  .content
    span.number {{ report.no % 1000 ? `編號 ${report.no}` : '小區域有感地震' }}
    span.location {{ extractLocationFromString(report.loc) }}
    span.time {{ toFormattedTimeString(report.time) }}
    .parameter-container
      .magnitude
        .vertical-bar
        .value {{ report.mag.toFixed(1) }}
      .depth
        .value {{ report.depth }}
        .vertical-bar
</template>

<style lang="scss" scoped>
.detailed-report-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
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

  > .intensity-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    > .intensity-box {
      width: 64px;
      font-size: 48px;
      line-height: 64px;
      font-weight: 700;
    }

    > .intensity-description {
      font-size: 9px;
    }
  }

  > .content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;

    > .number {
      opacity: 0.8;
      font-size: 12px;
    }

    > .location {
      line-height: 22px;
      font-size: 22px;
      font-weight: 900;
    }

    > .time {
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }

    > .parameter-container {
      display: flex;
      justify-content: space-between;

      > .magnitude,
      > .depth {
        display: flex;
        gap: 4px;
        padding-right: 12px;
        font-size: 18px;
        font-variant-numeric: tabular-nums;

        > .value {
          font-weight: 600;
        }
      }

      > .magnitude > .value::before {
        content: "M";
        margin-right: 4px;
        font-size: 75%;
        opacity: 0.6;
      }

      > .depth > .value::after {
        content: "㎞";
        margin-left: 4px;
        font-size: 75%;
        opacity: 0.6;
      }

      .vertical-bar {
        width: 4px;
        border-radius: 4px;
        background-color: aquamarine;
      }
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
