<script setup lang="ts">
import { onMounted } from "vue";
import type { EewEvent } from "../../types";
import {
  toFormattedTimeString,
  toFullWidthNumber,
} from "../../scripts/helper/utils";

const props = defineProps<{
  eew: Record<string, EewEvent>;
  currentEewIndex?: string;
}>();

onMounted(() => {});
</script>

<template lang="pug">
.info-box-wrapper
  .info-box
    .info-header
      .info-title 地震速報 ｜ CWA（取消）
      .info-subtitle(v-if="currentEewIndex") 第 {{ toFullWidthNumber(`${props.eew[currentEewIndex].serial}`) }} 報
    .info-body-box(v-if="currentEewIndex")
      .info-body-title-box
        .info-body-title-title-box
          .info-body-title-body-box
              .info-body-location-text {{ props.eew[currentEewIndex].location }}
              .info-body-eq-box
                  .info-body-magnitude.magnitude-6(data-background-text="規模")
                      .info-body-magnitude-value {{ props.eew[currentEewIndex].magnitude }}
                  .info-body-depth.depth-deep(data-background-text="深度")
                      .info-body-depth-value {{ props.eew[currentEewIndex].depth }}
      .info-body-footer
          .info-body-footer-title 預估最大震度
          .info-body-footer-value-container
              span.info-body-footer-value-time {{ toFormattedTimeString(props.eew[currentEewIndex].time) }}
              span.info-body-footer-value-name 發震
      .cancel-box(v-if="props.eew[currentEewIndex].cancel")
          .cancel-title #[span 取]#[span 消]
          .cancel-body 此地震速報已取消

</template>

<style lang="scss" scoped>
.info-box-wrapper {
  position: fixed;
  top: 8px;
  right: 8px;
  min-width: 320px;
  width: 20vw;

  > .info-box {
  }
}
</style>
