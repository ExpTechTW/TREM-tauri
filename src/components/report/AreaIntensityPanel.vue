<script setup lang="ts">
import AreaIntensityItem from "@/components/report/AreaIntensityItem.vue";

import type { AreaIntensity } from "@exptechtw/api-wrapper";

defineProps<{
  areas?: AreaIntensity[];
}>();
</script>

<template>
  <div class="area-intensity-panel">
    <div class="area-intensity-list-wrapper">
      <div class="area-intensity-list">
        <template v-for="area in areas">
          <AreaIntensityItem :area="area" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.area-intensity-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--t-surface-elevated-color);
  box-shadow: var(--t-elevated-shadow);
  min-height: 0;
  padding: 8px;
  border-radius: 8px;
}

.area-intensity-list-wrapper {
  height: 100%;
  min-height: 0;
  padding-right: 8px;
  overflow-y: auto;
}

.area-intensity-list {
  display: flex;
  flex-direction: column;
}
</style>
