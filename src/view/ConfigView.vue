<script setup lang="ts">
import ConfigTile from "@/components/config/ConfigTile.vue";
import ViewPanel from "@/components/misc/ViewPanel.vue";
import { useConfigStore } from "@/stores/config_store";
import Dropdown from "primevue/dropdown";

const configStore = useConfigStore();

const RtsMarkerDisplayOptions = [
  { label: "即時震度", value: 0 },
  { label: "地動加速度", value: 1 },
  { label: "地動速度", value: 2 },
];

configStore.$subscribe(() => {
  configStore.save();
});
</script>

<template>
  <div id="config">
    <ViewPanel id="config" title="設定">
      <ConfigTile>
        <template #title>觀測點資料</template>
        <template #subtitle>選擇即時地動資料在地圖上的呈現方式</template>
        <template #trailing>
          <Dropdown
            v-model="configStore.earthquake.display"
            :options="RtsMarkerDisplayOptions"
            option-label="label"
            option-value="value"
          />
        </template>
      </ConfigTile>
    </ViewPanel>
  </div>
</template>
