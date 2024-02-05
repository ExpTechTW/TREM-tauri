<script setup lang="ts">
import CircleMarker from "./CircleMarker.vue";
import CrossMarker from "./CrossMarker.vue";

import type { ComponentPublicInstance, Ref } from "vue";
import { inject, onMounted, onUnmounted, ref } from "vue";
import maplibregl from "maplibre-gl";

import { EewStatus, type Eew } from "../../scripts/class/api";
import type { NtpTime } from "../../types";
import {
  findClosestDepthIndex,
  sideDistance,
} from "../../scripts/helper/utils";
import times from "../../assets/json/time.json";

const props = defineProps<{
  map: maplibregl.Map;
  eew: Eew;
}>();

const depthIndexList = Object.keys(times);
const waveRadius = ref({ p: 0, s: 0 });

let marker: maplibregl.Marker;
const crossTemplate = ref<ComponentPublicInstance<typeof CrossMarker>>();
const time = inject<Ref<NtpTime>>("ntp");

const getAccurateTime = () => {
  return time!.value.server + (Date.now() - time!.value.client);
};

const updateWave = () => {
  const accurateTime = getAccurateTime();
  const newRadius = { p: 0, s: 0 };
  const index =
    `${findClosestDepthIndex(depthIndexList, props.eew.eq.depth)}` as keyof typeof times;

  const time_table = times[index];
  let prev_table = null;

  for (const table of time_table) {
    if (!newRadius.p && table.P > (accurateTime - props.eew.eq.time) / 1000) {
      if (prev_table) {
        const t_diff = table.P - prev_table.P;
        const r_diff = table.R - prev_table.R;
        const t_offset =
          (accurateTime - props.eew.eq.time) / 1000 - prev_table.P;
        const r_offset = (t_offset / t_diff) * r_diff;
        newRadius.p = prev_table.R + r_offset;
      } else {
        newRadius.p = table.R;
      }
    }
    if (!newRadius.s && table.S > (accurateTime - props.eew.eq.time) / 1000) {
      if (prev_table) {
        const t_diff = table.S - prev_table.S;
        const r_diff = table.R - prev_table.R;
        const t_offset =
          (accurateTime - props.eew.eq.time) / 1000 - prev_table.S;
        const r_offset = (t_offset / t_diff) * r_diff;
        newRadius.s = prev_table.R + r_offset;
      } else {
        newRadius.s = table.R;
      }
    }
    if (newRadius.p && newRadius.s) {
      break;
    }
    prev_table = table;
  }

  if (!newRadius.p) {
    newRadius.p = sideDistance(
      ((accurateTime - props.eew.eq.time) / 1000) * 7,
      props.eew.eq.depth
    );
  }
  if (!newRadius.s) {
    newRadius.s = sideDistance(
      ((accurateTime - props.eew.eq.time) / 1000) * 4,
      props.eew.eq.depth
    );
  }

  waveRadius.value = newRadius;
};

const updateCrossFlash = (state: boolean) => {
  marker.setOpacity(state ? "1" : "0");
};

defineExpose({
  redrawWave() {
    updateWave();
  },
  redrawCross(crossState: boolean) {
    updateCrossFlash(crossState);
  }
});

onMounted(() => {
  updateWave();

  marker = new maplibregl.Marker({
    element: crossTemplate.value?.$el,
  })
    .setLngLat([props.eew.eq.lon, props.eew.eq.lat])
    .addTo(props.map);
});

onUnmounted(() => {
  marker.remove();
});
</script>

<template lang="pug">
CrossMarker(ref="crossTemplate", :map="map", :size="28", :z-index="1000")
CircleMarker(:map="map", type="s", :radius="waveRadius.s", :lng="props.eew.eq.lon", :lat="props.eew.eq.lat", :alert="props.eew.status == EewStatus.Alert", :z-index="1000")
CircleMarker(:map="map", type="p", :radius="waveRadius.p", :lng="props.eew.eq.lon", :lat="props.eew.eq.lat", :alert="props.eew.status == EewStatus.Alert", :z-index="1000")
</template>
