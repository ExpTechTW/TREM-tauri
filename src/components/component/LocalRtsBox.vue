<script setup lang="ts">
import type { Ref } from "vue";

import type { Rts, Station } from "../../scripts/class/api";

defineProps<{
  station: string;
  stations: Ref<Record<string, Station>>;
  rts: Ref<Rts>;
}>();
</script>

<template lang="pug">
.local-rts-box
  .title-container
    span.title-icon.material-symbols-rounded speed
    span.title 即時地動資料
  .station-container
    .station
      .station-detail
        .location {{ stations.value[station]?.city ?? "載入中..." }} {{ stations.value[station]?.town ?? "" }}
        .info
          span.net {{ stations.value[station]?.net ?? "載入中..." }}
          span.id {{ station }}
      .divider
      .station-data 
        .data-field
          span.name 計測震度
          span.value {{ rts.value.station[station]?.I?.toFixed(1) ?? "無資料" }}
        .data-field
          span.name PGA
          span.unit gal
          span.value {{ rts.value.station[station]?.pga?.toFixed(2) ?? "無資料" }}
        .data-field
          span.name PGV
          span.unit kine
          span.value {{ rts.value.station[station]?.pgv?.toFixed(2) ?? "無資料" }}
</template>

<style lang="scss" scoped>
.local-rts-box {
  gap: 8px;
}

.station-container {
  display: flex;
  flex-direction: column;
}

.station {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 16px;
  background-color: hsl(var(--surface-variant-hsl));
}

.station-detail {
  flex: 4;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 2px;

  > .location {
    line-height: 24px;
    font-size: 18px;
    font-weight: 700;
  }

  > .info {
    display: flex;
    gap: 4px;
    opacity: 0.8;
    font-size: 12px;
    font-weight: 400;
  }
}

.divider {
  width: 2px;
  border-radius: 2px;
  background-color: hsl(0deg 0% 100% / 0.4);
}

.station-data {
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 12px;

  .data-field {
    display: flex;
    gap: 4px;

    > .name {
      font-weight: 700;
    }

    &:not(:has(.name + .unit)) .name {
      flex: 1;
    }

    > .unit {
      flex: 1;
      opacity: 0.6;
    }
  }
}
</style>
