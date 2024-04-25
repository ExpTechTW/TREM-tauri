<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from "vue";
import { useReportStore } from "@/stores/report_store";

import Global from "@/global";
import ReportItem from "@/components/report/ReportItem.vue";
import { useMapStore } from "@/stores/map_store";
import { TaiwanBounds } from "@/helpers/constant";
import MaterialSymbols from "@/components/misc/MaterialSymbols.vue";
import Panel from "primevue/panel";
import InputSwitch from "primevue/inputswitch";
import MultiSelect from "primevue/multiselect";
import ProgressSpinner from "primevue/progressspinner";

const FilterIntensityOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5⁻", value: 5 },
  { label: "5⁺", value: 6 },
  { label: "6⁻", value: 7 },
  { label: "6⁺", value: 8 },
  { label: "7", value: 9 },
];

const FilterMagnitudeOptions = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
];

const mapStore = useMapStore();
const reportStore = useReportStore();
const filters = reactive<{
  numbered: boolean;
  intensity: number[];
  magnitude: number[];
}>({
  numbered: false,
  intensity: [],
  magnitude: [],
});

const filteredList = computed(() =>
  reportStore.list
    .filter((v) => !filters.numbered || (filters.numbered && v.no % 1000))
    .filter(
      (v) => !filters.intensity.length || filters.intensity.includes(v.int)
    )
    .filter(
      (v) => !filters.magnitude.length || filters.magnitude.includes(~~v.mag)
    )
);

onMounted(() => {
  console.log("mount");

  Global.api.getReportList().then((v) => {
    reportStore.$patch({ partial: new Map(v.map((v) => [v.id, v])) });
  });

  window.setTimeout(() => mapStore.map?.fitBounds(TaiwanBounds));
});

onUnmounted(() => {
  console.log("unmount");
});
</script>

<template>
  <div id="report-wrapper">
    <div class="list-header">
      <MaterialSymbols icon="earthquake" />
      <span>地震報告</span>
    </div>
    <Panel class="filter-panel" toggleable collapsed>
      <template #header>
        <div class="filter-header">
          <MaterialSymbols icon="filter_alt" :size="22" />
          <span>篩選器</span>
        </div>
      </template>
      <template #togglericon="{ collapsed }">
        <div class="toggler-icon" :class="{ collapsed }">
          <MaterialSymbols icon="arrow_drop_down" />
        </div>
      </template>
      <div class="filter-list">
        <label class="filter-item" for="filter-numbered">
          <div class="filter-label">只顯示編號報告</div>
          <InputSwitch v-model="filters.numbered" input-id="filter-numbered" />
        </label>
        <div class="filter-item">
          <div class="filter-label">最大震度</div>
          <MultiSelect
            v-model="filters.intensity"
            :options="FilterIntensityOptions"
            option-label="label"
            option-value="value"
            :style="{ width: '120px' }"
          />
        </div>
        <div class="filter-item">
          <div class="filter-label">規模</div>
          <MultiSelect
            v-model="filters.magnitude"
            :options="FilterMagnitudeOptions"
            option-label="label"
            option-value="value"
            :style="{ width: '120px' }"
          />
        </div>
      </div>
    </Panel>
    <div class="report-list">
      <ReportItem
        v-if="reportStore.list.length"
        v-for="(report, i) in filteredList"
        :key="`report-item-${report.id}`"
        :report="report"
        :markerOpacity="0.25 + 0.75 * (1 - i / filteredList.length)"
        :markerZIndex="filteredList.length - i"
      />
      <ProgressSpinner
        v-else
        style="height: 32px; width: 32px"
        strokeWidth="4"
      />
    </div>
  </div>
</template>

<style scoped>
#report-wrapper {
  display: flex;
  flex-direction: column;
  width: 280px;
  max-height: 100%;
  padding: 0 8px;
  border-radius: 8px;
  overflow-y: auto;
}

.report-list {
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  font-size: 18px;
  font-weight: bold;
  color: var(--p-surface-0);
}

.filter-panel {
  margin: 8px;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggler-icon {
  display: grid;
  align-items: center;
  justify-content: center;
  rotate: 180deg;
  transition: rotate 0.2s ease-in-out;
}

.toggler-icon.collapsed {
  rotate: 0deg;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  flex: 1;
  font-size: 14px;
}
</style>
@/stores/report_store
