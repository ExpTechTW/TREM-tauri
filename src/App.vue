<script setup lang="ts">
import { ref } from "vue";
import MapView from "./components/MapView.vue";
import ReportBox from "./components/view/ReportBox.vue";
import ReportListBox from "./components/view/ReportListBox.vue";

import type { PartialReport } from "./scripts/class/api";

const { reports } = defineProps<{reports: PartialReport[] }>();

const activeReport = ref<PartialReport>()

const hideReport = () => {
  document.getElementById("report-box")?.classList.remove("show");
}

const changeReport = (report: PartialReport) => {
  activeReport.value = report;
  document.getElementById("report-box")?.classList.add("show");
}
</script>

<template lang="pug">
MapView
ReportBox(:report="activeReport" :hideReport="hideReport")
ReportListBox(:reports="reports" :activeReport="activeReport" :changeReport="changeReport")
</template>

<style scoped>

</style>
./scripts/class/api