<script setup lang="ts">
import MapView from "./components/view/MapView.vue";
import ReportBox from "./components/view/ReportBox.vue";
import ReportListBox from "./components/view/ReportListBox.vue";

import { inject, ref } from "vue";
import type { Ref } from "vue";

import type { ExpTechApi, Report, PartialReport, Rts } from "./scripts/class/api";

const { reports } = defineProps<{ reports: PartialReport[]; rts: Ref<Rts>; }>();
const api = inject<ExpTechApi>("api");

const activeReport = ref<Report>();
const currentView = ref<string>("report-list");

const handleHideReportBox = () => {
  currentView.value = "report-list";
};

const changeReport = async (report: PartialReport) => {
  if (!api) return;
  activeReport.value = undefined;
  currentView.value = "report";
  const fullReport = await api?.getReport(report.id);
  console.log(fullReport);
  activeReport.value = fullReport;
};

</script>

<template lang="pug">
MapView(:current-view="currentView", :active-report="activeReport", :rts="rts")
ReportBox(:current-view="currentView", :report="activeReport", :handle-hide-report-box="handleHideReportBox")
ReportListBox(:current-view="currentView", :reports="reports", :change-report="changeReport")
</template>

<style scoped></style>