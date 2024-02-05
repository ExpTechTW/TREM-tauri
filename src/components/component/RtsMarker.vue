<script setup lang="ts">
import maplibregl from "maplibre-gl";
import { onMounted, onUnmounted, ref } from "vue";

import type { RtsStation, Station } from "../../scripts/class/api";
import { pga } from "../../scripts/helper/color";
import code from "../../assets/json/code.json";

const props = defineProps<{
  map: maplibregl.Map;
  stationId: string;
  station: Station;
  rts?: RtsStation;
}>();

let marker: maplibregl.Marker;
const markerTemplate = ref<HTMLDivElement>();

onMounted(() => {
  marker = new maplibregl.Marker({ element: markerTemplate.value })
    .setLngLat([props.station.info[0].lon, props.station.info[0].lat])
    .addTo(props.map);
});

onUnmounted(() => {
  marker.remove();
});
</script>

<template lang="pug">
.rts-marker(ref="markerTemplate" :style="{ zIndex: ((rts?.i ?? -5) + 5) * 10}")
  .rts-marker-body(:class="(rts  && rts.alert && rts.i >= 1) ? `has-intensity intensity-${~~rts.i}`:''", :style="(rts && !rts.alert && rts.i < 1 ) ? `background-color: ${pga(rts.i)}`: ''")
    .rts-marker-detail
      .rts-marker-detail-title
        span {{ code[station.info[0].code]?.city ?? "境外" }}
        span {{ code[station.info[0].code]?.town ?? "" }}
        .station-identifier 
          span.station-net {{ station.net }}
          span.station-id {{ stationId }}
      .rts-data
        .rts-pga
          span.rts-value pga: {{ rts?.pga ?? "無資料" }}
        .rts-pgv
          span.rts-value pgv: {{ rts?.pgv ?? "無資料" }}
        .rts-i
          span.rts-value i: {{ rts?.i ?? "無資料" }}
        .rts-I
          span.rts-value I: {{ rts?.I ?? "無資料" }}
</template>

<style lang="scss" scoped>
.rts-marker {
  opacity: 1;
  transition: opacity 0.1s cubic-bezier(0.2, 0, 0, 1);

  &:hover {
    z-index: 1000 !important;
  }

  > .rts-marker-body {
    position: relative;
    display: grid;
    align-items: center;
    justify-content: center;
    height: 8px;
    width: 8px;
    border-radius: 8px;
    outline: 1px solid #aaa;
    cursor: pointer;
    transition:
      height 0.1s cubic-bezier(0.2, 0, 0, 1),
      width 0.1s cubic-bezier(0.2, 0, 0, 1),
      background-color 0.1s cubic-bezier(0.2, 0, 0, 1);

    &.has-intensity {
      height: 16px;
      width: 16px;
      line-height: 18px;
      font-size: 14px;
      font-weight: 700;
      outline: 2px solid #fff;
      text-align: center;
    }

    &::before {
      position: absolute;
      top: 12px;
      width: 8px;
      height: 8px;
      background-color: hsl(var(--surface-variant-hsl));
      transform: rotate(45deg);
    }

    > .rts-marker-detail {
      all: unset;
      position: absolute;
      top: 100%;
      left: -8px;
      display: none;
      flex-direction: column;
      margin-top: 8px;
      padding: 8px;
      background-color: hsl(var(--surface-variant-hsl));
      border-radius: 8px;
      white-space: nowrap;
      text-rendering: optimizeLegibility;
      box-shadow: 0 0 8px 0 hsl(var(--background-hsl) / 0.6);
      cursor: default;

      > .rts-marker-detail-title {
        display: flex;
        gap: 4px;
        font-size: 16px;
        font-weight: 700;

        > .station-identifier {
          display: flex;
          flex-direction: column;
          font-weight: 400;

          > .station-net {
            line-height: 8px;
            font-size: 8px;
          }

          > .station-id {
            line-height: 10px;
            font-size: 10px;
          }
        }
      }

      > .rts-data {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr;
      }
    }

    &:hover::before {
      content: "";
    }

    &:hover > .rts-marker-detail {
      display: flex;
    }
  }
}
</style>
