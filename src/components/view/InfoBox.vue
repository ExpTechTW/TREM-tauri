<script setup lang="ts">
import IntensityBox from "../component/IntensityBox.vue";

import { onMounted } from "vue";

import type { EewEvent } from "../../types";
import { EewStatus } from "../../scripts/class/api";
import {
  toFormattedTimeString,
  toFullWidthNumber,
} from "../../scripts/helper/utils";

const props = defineProps<{
  eew: Record<string, EewEvent>;
  currentEewIndex?: string;
}>();

const InfoBoxStatusClass = {
  [EewStatus.Warn]: "warn",
  [EewStatus.Alert]: "alert",
  [EewStatus.Cancel]: "cancel",
  [EewStatus.Test]: "test",
};

const InfoBoxStatusText = {
  [EewStatus.Warn]: "（注意）",
  [EewStatus.Alert]: "（警報）",
  [EewStatus.Cancel]: "（取消）",
  [EewStatus.Test]: "（測試）",
};

onMounted(() => {});
</script>

<template lang="pug">
.info-box-wrapper
  .info-box(:class="currentEewIndex ? InfoBoxStatusClass[eew[currentEewIndex].status] : ''")
    .header
      .header-title(v-if="currentEewIndex") 地震速報 ｜ {{ eew[currentEewIndex].source.toUpperCase() }}{{ InfoBoxStatusText[eew[currentEewIndex].status] }}
      .header-title(v-else) 目前無發布地震預警
      .header-subtitle(v-if="currentEewIndex") 第 {{ toFullWidthNumber(`${eew[currentEewIndex].serial}`) }} 報
    .body(v-if="currentEewIndex")
      .detail-container
        IntensityBox(:int="props.eew[currentEewIndex].max")
        .detail
          .location {{ props.eew[currentEewIndex].location }}
          .parameter-container
            .magnitude.magnitude-6(data-background-text="規模")
              .magnitude-value {{ props.eew[currentEewIndex].magnitude }}
            .depth.depth-deep(data-background-text="深度")
              .depth-value {{ props.eew[currentEewIndex].depth }}
      .footer
        .footer-title 預估最大震度
        .time-container
          span.time {{ toFormattedTimeString(props.eew[currentEewIndex].time) }}
          span.time-name 發震
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
  z-index: 5000;

  > .info-box {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 20vw;
    min-width: 277px;
    margin: 8px;
    padding: 8px;
    border-radius: 20px;
    background-color: #505050;
    color: white;
    white-space: nowrap;

    &.warn {
      color: #000;
      background-color: #fb0;
    }

    &.alert {
      background-color: #f22;
    }
    &.test {
      background-color: #26f;
    }

    &.cancel {
      background-color: #505050;
    }

    > .header {
      display: flex;
      padding: 0 8px;
      line-height: 14px;
      font-size: 14px;
      font-weight: 700;

      /* 標題左邊 */
      > .header-title {
        flex: 1;
      }
    }

    > .body {
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      border-radius: 16px;
      background-color: #383838;
      color: #fff;
      padding: 8px;

      > .detail-container {
        display: flex;
        height: 72px;
        gap: 8px;

        > .info-body-title-title-box,
        > .detail {
          padding: 8px;
          border-radius: 12px;
        }

        > .intensity-box {
          width: 72px;
          aspect-ratio: 1;
          line-height: 72px;
          font-size: 48px;
          font-family: "Open Sans", sans-serif;
          font-weight: 800;
          text-align: center;
        }

        > .detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background-color: #222;

          > .location {
            line-height: 20px;
            font-size: 20px;
            font-family: "Noto Sans TC";
            font-weight: 700;
          }

          > .parameter-container {
            display: flex;

            > .magnitude,
            > .depth {
              position: relative;
              display: flex;
              gap: 4px;
              height: 28px;
              isolation: isolate;
            }

            > .magnitude::after,
            > .depth::before {
              position: absolute;
              content: attr(data-background-text);
              padding: 0 6px;
              line-height: 28px;
              font-size: 28px;
              font-weight: 700;
              opacity: 0.15;
              z-index: -1;
            }

            > .magnitude::before,
            > .depth::after {
              content: "";
              display: block;
              width: 4px;
              border-radius: 30px;
            }

            > .magnitude > .magnitude-value,
            > .depth > .depth-value {
              font-weight: 700;
              line-height: 28px;
            }

            > .magnitude > .magnitude-value::before,
            > .depth > .depth-value::after {
              display: inline-block;
              opacity: 0.75;
              line-height: 28px;
              font-weight: 400;
            }

            > .magnitude {
              flex: 1;
              font-size: 24px;

              &::before {
                background-color: #c800c0;
              }

              > .magnitude-value {
                margin-top: 2px;

                &::before {
                  margin-right: 4px;
                  content: "M";
                  font-size: 16px;
                }
              }
            }

            > .depth {
              &::before {
                right: 0;
              }

              &::after {
                background-color: #ff1f00;
              }

              > .depth-value {
                font-size: 20px;
                line-height: 36px;

                &::after {
                  margin-left: 4px;
                  content: "㎞";
                  font-size: 12px;
                }
              }
            }
          }
        }
      }

      > .footer {
        display: flex;
        align-items: center;
        padding: 0 4px;
        line-height: 12px;
        font-size: 12px;

        > .footer-title {
          opacity: 0.75;
          font-size: 11px;
          flex: 1;
        }

        > .time-container {
          display: flex;
          align-items: center;
          gap: 4px;

          > .time {
            line-height: 16px;
            font-size: 15px;
            font-weight: 500;
          }

          > .time-name {
            opacity: 0.75;
            line-height: 16px;
          }
        }
      }
    }

    > .body > .cancel-box {
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      gap: 8px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background-color: rgb(0 0 0 / 40%);
      color: white;
      text-shadow:
        2px 2px black,
        -2px -2px black,
        -2px 2px black,
        2px -2px black;
      backdrop-filter: blur(1px);
      z-index: 1001;

      > .cancel-title {
        display: flex;
        justify-content: space-between;
        width: 30%;
        line-height: 36px;
        font-weight: 900;
        font-size: 36px;
      }

      > .cancel-body {
        line-height: 14px;
        font-weight: 500;
        font-size: 14px;
      }
    }

    &.cancelled > .body > .cancel-box {
      display: flex;
    }
  }
}
</style>
