<script setup lang="ts">
import Time from "./components/component/Time.vue";
import MapView from "./components/view/MapView.vue";
import NavigationBar from "./components/component/NavigationBar.vue";
import ReportBox from "./components/view/ReportBox.vue";
import ReportListBox from "./components/view/ReportListBox.vue";

import { inject, ref } from "vue";
import type { Ref } from "vue";

import type { ExpTechApi, Report, PartialReport, Rts, Station } from "./scripts/class/api";

defineProps<{
  reports: PartialReport[];
  stations: Ref<Record<string, Station>>;
  rts: Ref<Rts>;
}>();

const api = inject<ExpTechApi>("api");

const activeReport = ref<Report>();
const currentView = ref<string>("home");

const changeView = (view: string) => {
  currentView.value = view;
};

const handleHideReportBox = () => {
  currentView.value = "report-list";
};

const changeReport = async (report: PartialReport) => {
  if (!api) return;
  activeReport.value = undefined;
  currentView.value = "report";
  const fullReport = await api?.getReport(report.id);
  activeReport.value = fullReport;
};

</script>

<template lang="pug">
NavigationBar(:current-view="currentView", :change-view="changeView")
Time(:timestamp="rts.value.time")
MapView(:current-view="currentView", :reports="reports", :active-report="activeReport", :stations="stations", :rts="rts")
ReportBox(:current-view="currentView", :report="activeReport", :handle-hide-report-box="handleHideReportBox")
ReportListBox(:current-view="currentView", :reports="reports", :change-report="changeReport")
</template>

<style scoped></style>