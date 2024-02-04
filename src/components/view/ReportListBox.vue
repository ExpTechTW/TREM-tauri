<script setup lang="ts">
import type { PartialReport } from '../../scripts/class/api';
import ReportItem from '../component/ReportItem.vue';
defineProps<{
  currentView: string;
  reports: PartialReport[];
  changeReport(report: PartialReport): void;
}>();
</script>

<template lang="pug">
.report-list-wrapper
  #report-panel.report-list-scrollview.panel(:class="{ show: currentView.startsWith('report') }")
    .report-list-scroller
      .report-list
        ReportItem(v-for="report in reports", :key="report.id" :report='report', :change-report="changeReport")
</template>

<style scoped>
.report-list-wrapper {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 8px;
  bottom: 8px;
  right: 8px;
  min-width: 320px;
  width: 20vw;
  z-index: 1000;
  overflow: hidden;
  pointer-events: none;

  /* dim when report is open */
  filter: none;
  transition-property: filter;
  transition-duration: .2s;
  transition-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);
}

body:has(#report-box.show) .report-list-wrapper {
  filter: brightness(60%);
  transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);

  >.report-list-scrollview {
    pointer-events: none;
  }
}

.report-list-scrollview {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px;
  border-radius: 16px;
  background-color: hsl(var(--surface-hsl));
  pointer-events: all;

  /* animation */
  opacity: 0;
  translate: 100%;
  transition-property: opacity, translate;
  transition-duration: .2s;
  transition-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);

  &.show {
    opacity: 1;
    translate: 0;
    transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);
  }

  &:hover {
    padding-right: 4px;
  }

  &:hover>.report-list-scroller {
    overflow-y: auto;
    padding-right: 4px;
  }

  >.report-list-scroller {
    min-height: 0;
    overflow-y: hidden;

    &::-webkit-scrollbar-track {
      background-color: hsl(var(--background-variant-hsl));
    }

    &::-webkit-scrollbar-button {
      background-color: transparent;
      height: 4px;
    }
  }
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>