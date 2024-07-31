<script setup lang="ts">
import global from "~/global";

const mapStore = useMapStore();
const reportStore = useReportStore();

onMounted(() => {
  mapStore.map?.setLayoutProperty("reports", "visibility", "visible");
  global.api.getReportList().then((data) => {
    reportStore.update(data);
  });
});

onUnmounted(() => {
  mapStore.map?.setLayoutProperty("reports", "visibility", "none");
});
</script>

<template>
  <div class="flex-col">
    <ReportItem
      v-for="report in reportStore.partial"
      :key="report.id"
      :report="report"
    />
  </div>
</template>
