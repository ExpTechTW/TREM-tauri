<script setup lang="ts">
import InfoBox from "./components/view/InfoBox.vue";
import TimeDisplay from "./components/component/TimeDisplay.vue";
import MapView from "./components/view/MapView.vue";
import NavigationBar from "./components/component/NavigationBar.vue";
import ReportBox from "./components/view/ReportBox.vue";
import ReportListBox from "./components/view/ReportListBox.vue";

import type { Ref } from "vue";
import { inject, ref } from "vue";

import type {
  ExpTechApi,
  Report,
  PartialReport,
  Rts,
  Station,
} from "./scripts/class/api";
import type { EewEvent } from "./types";

defineProps<{
  reports: PartialReport[];
  stations: Ref<Record<string, Station>>;
  rts: Ref<Rts>;
  currentEewIndex: Ref<string>;
  eew: Record<string, EewEvent>;
}>();

const api = inject<ExpTechApi>("api");

const activeReport = ref<Report>();
const currentView = ref<string>("home");

defineExpose({
  changeView(view: string) {
    if (currentView.value == view) currentView.value = "home";
    else currentView.value = view;
  },
});

const changeView = (view: string) => {
  if (currentView.value == view) currentView.value = "home";
  else currentView.value = view;
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
TimeDisplay(:timestamp="rts.value.time")
MapView(:current-view="currentView", :reports="reports", :active-report="activeReport", :stations="stations", :rts="rts", :eew="eew", :current-eew-index="currentEewIndex", :change-report="changeReport")
InfoBox(:current-view="currentView", :eew="eew", :current-eew-index="currentEewIndex.value")
ReportBox(:current-view="currentView", :report="activeReport", :handle-hide-report-box="handleHideReportBox")
ReportListBox(:current-view="currentView", :reports="reports", :change-report="changeReport")
</template>

<style lang="scss" scoped></style>
