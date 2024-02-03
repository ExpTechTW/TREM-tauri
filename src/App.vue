<script setup lang="ts">
import { inject, ref } from "vue";
import MapView from "./components/view/MapView.vue";
import ReportBox from "./components/view/ReportBox.vue";
import ReportListBox from "./components/view/ReportListBox.vue";

import type { ExpTechApi, Report, PartialReport } from "./scripts/class/api";

const { reports } = defineProps<{ reports: PartialReport[]; }>();
const api = inject<ExpTechApi>("api");

const activeReport = ref<Report>();
const isReportBoxShown = ref<boolean>(false);

const handleHideReportBox = () => {
  isReportBoxShown.value = false;
};

const changeReport = async (report: PartialReport) => {
  if (!api) return;
  activeReport.value = undefined;
  isReportBoxShown.value = true;
  const fullReport = await api?.getReport(report.id);
  console.log(fullReport);
  activeReport.value = fullReport;
};
</script>

<template lang="pug">
MapView
ReportBox(:report="activeReport", :isReportBoxShown="isReportBoxShown", :handleHideReportBox="handleHideReportBox")
ReportListBox(:reports="reports", :changeReport="changeReport")
</template>

<style scoped></style>