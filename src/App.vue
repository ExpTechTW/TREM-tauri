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
MapView(:active-report="activeReport", :rts="rts", :is-report-box-shown="isReportBoxShown")
ReportBox(:report="activeReport", :is-report-box-shown="isReportBoxShown", :handle-hide-report-box="handleHideReportBox")
ReportListBox(:reports="reports", :change-report="changeReport")
</template>

<style scoped></style>