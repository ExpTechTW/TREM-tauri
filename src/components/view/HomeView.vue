<script setup lang="ts">
import DetailedReportItem from "../component/DetailedReportItem.vue";
import FilledButton from "../component/FilledButton.vue";
import IntensityBox from "../component/IntensityBox.vue";
import LocalRtsBox from "../component/LocalRtsBox.vue";
import ReportIntensityItem from "../component/ReportIntensityItem.vue";
import ReportItem from "../component/ReportItem.vue";
import WaveTimer from "../component/WaveTimer.vue";

import type { SettingsManager } from "tauri-settings";
import type { Ref } from "vue";
import { onMounted, inject } from "vue";

import type { DefaultConfigSchema, EewEvent } from "../../types";
import type { PartialReport, Rts, Station } from "../../scripts/class/api";
import { EewStatus } from "../../scripts/class/api";
import { toFormattedTimeString } from "../../scripts/helper/utils";

defineProps<{
  currentView: string;
  rts: Ref<Rts>;
  stations: Ref<Record<string, Station>>;
  eew: Record<string, EewEvent>;
  currentEewIndex?: string;
  reports: PartialReport[];
  changeView: (view: string) => void;
  changeReport(report: PartialReport): void;
}>();

const setting = inject<SettingsManager<DefaultConfigSchema>>("settings");

const InfoBoxStatusClass = {
  [EewStatus.Warn]: "warn",
  [EewStatus.Alert]: "alert",
  [EewStatus.Cancel]: "cancel",
  [EewStatus.Test]: "test",
};

const InfoBoxStatusText = {
  [EewStatus.Warn]: "(注意)",
  [EewStatus.Alert]: "(警報)",
  [EewStatus.Cancel]: "(取消)",
  [EewStatus.Test]: "(測試)",
};

onMounted(() => {});
</script>

<template lang="pug">
.home-view(:class="{eew: currentEewIndex != undefined}")
  .home-info-box-wrapper
    .home-info-box-container
      .home-info-box(:class="{[currentEewIndex ? InfoBoxStatusClass[eew[currentEewIndex].status] : '']: true, show: currentView == 'home'}")
        .header
          .title-container
            .header-title(v-if="currentEewIndex")
              | 地震速報
              | #[span.current-eew-index(v-if="Object.keys(eew).length > 1") {{ Object.keys(eew).indexOf(currentEewIndex) + 1 }}]
              | #[span.total-eew-count(v-if="Object.keys(eew).length > 1") {{ Object.keys(eew).length }}]
              |｜
              |{{ eew[currentEewIndex].source.toUpperCase() }} {{ InfoBoxStatusText[eew[currentEewIndex].status] }}
            .header-title(v-else) 目前無發布地震預警
            .header-subtitle(v-if="currentEewIndex && !eew[currentEewIndex].final") 第{{ `${eew[currentEewIndex].serial}` }}報
            .header-subtitle(v-else-if="currentEewIndex") \#{{ `${eew[currentEewIndex].serial}` }} (最終)
          .header-body(v-if="currentEewIndex")
            .detail-container
              IntensityBox(:int="eew[currentEewIndex].max == 0 ? -1 : eew[currentEewIndex].max")
              .detail
                .location {{ eew[currentEewIndex].location || "未知區域" }}
                .parameter-container(v-if="eew[currentEewIndex].detail")
                  .magnitude.magnitude-6(data-background-text="規模")
                    .magnitude-value {{ eew[currentEewIndex].magnitude.toFixed(1) }}
                  .depth.depth-deep(data-background-text="深度")
                    .depth-value {{ eew[currentEewIndex].depth }}
                .parameter-container(v-else)
                  .nsspe NSSPE 假設震源參數
            .footer
              .footer-title 預估最大震度
              .time-container
                span.time {{ toFormattedTimeString(eew[currentEewIndex].time) }}
                span.time-name 發震
            .cancel-box(v-if="eew[currentEewIndex].cancel")
              .cancel-title #[span 取]#[span 消]
              .cancel-body 此地震速報已取消
        .intensity(v-if="rts.value.int.length")
          .intensity-title 最大觀測震度
          .intensity-list-wrapper
            .intensity-list-scroller
              .intensity-list
                template(v-for="r in rts.value.int", :key="r.station")
                  ReportIntensityItem(:area="r?.area", :station="r.station", :int="r.i")
    template(v-for="(e, id) in eew", :key="id")
      WaveTimer(v-if="e.t && e.detail" , :eew="e", :index="Object.keys(eew).indexOf(id) + 1")
  .home-report-box-wrapper(v-if="!currentEewIndex")
    .home-report-box(:class="{ show: !currentEewIndex && currentView == 'home' }")
      .title-container
        span.title-icon.material-symbols-rounded earthquake
        span.title 近期地震報告
        FilledButton(label="顯示更多", trailing-icon="arrow_forward" ,@click="changeView('report-list')")
      .report-container
        DetailedReportItem(v-if="reports[0]", :report="reports[0]", :change-report="changeReport")
        ReportItem(v-if="reports[1]", :report="reports[1]", :change-report="changeReport")
        ReportItem(v-if="reports[2]", :report="reports[2]", :change-report="changeReport")
        ReportItem(v-if="reports[3]", :report="reports[3]", :change-report="changeReport")
        ReportItem(v-if="reports[4]", :report="reports[4]", :change-report="changeReport")
  .home-local-rts-box-wrapper(v-if="setting?.settings?.location?.station")
    LocalRtsBox.home-local-rts-box(:class="{ show:  currentView == 'home' }", :station="setting.settings.location.station", :stations="stations", :rts="rts")
</template>

<style lang="scss">
// common style
.home-view {
  position: fixed;
  top: 8px;
  right: 8px;
  bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 300px;
  width: 20vw;
  pointer-events: none;
  opacity: 1;
  z-index: 5000;
  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);

  &.eew > .home-info-box-wrapper {
    flex: 1;
  }

  &.eew .home-local-rts-box {
    opacity: 1;
  }

  .title-container {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 0 4px;
    line-height: 14px;
    font-size: 14px;
    font-weight: 700;

    > .title-icon {
      line-height: 20px;
      font-size: 20px;
    }

    > .title {
      flex: 1;
    }
  }
}

.home-info-box,
.home-report-box,
.home-weather-box,
.home-local-rts-box {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 20px;
  background-color: #505050;
  color: #fff;
  white-space: nowrap;

  pointer-events: all;
  border-radius: 20px;
  opacity: 0;
  translate: 100%;
  transition-property: opacity, translate;
  transition-duration: 0.4s, 0.2s;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1),
    cubic-bezier(0.3, 0, 0.8, 0.15);

  &.show {
    translate: 0;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1),
      cubic-bezier(0.05, 0.7, 0.1, 1);
  }
}

.home-info-box.show {
  opacity: 1;
}

.home-report-box.show,
.home-weather-box.show,
.home-local-rts-box.show {
  opacity: 0.8;
}

.home-report-box,
.home-weather-box,
.home-local-rts-box {
  padding: 8px;

  &:hover {
    opacity: 1;
  }
}

.map-container:active ~ .home-view {
  opacity: 0.2;
  pointer-events: none;
}
</style>

<style lang="scss" scoped>
.home-info-box-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;

  > .home-info-box-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    > .home-info-box {
      &.warn > .header {
        color: #000;
        background-color: #fb0;
      }

      &.alert > .header {
        background-color: #f22;
      }

      &.test > .header {
        background-color: #26f;
      }

      &.cancel > .header {
        background-color: #505050;
      }

      > .header {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        border-radius: 20px;
        line-height: 14px;
        font-size: 14px;
        font-weight: 700;

        > .title-container {
          display: flex;
          padding: 0 8px;

          > .header-title {
            flex: 1;

            > .total-eew-count::before {
              content: "/";
            }
          }
        }

        > .header-body {
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
              font-size: 52px;
              font-weight: 900;
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

                > .nsspe {
                  font-size: 16px;
                  font-weight: 400;
                  line-height: 28px;
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
      }

      &.cancelled > .body > .cancel-box {
        display: flex;
      }

      > .intensity {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        min-height: 0;

        > .intensity-title {
          padding: 0 8px;
          font-size: 14px;
          font-weight: 500;
        }

        > .intensity-list-wrapper {
          position: relative;
          border-radius: 16px;
          padding: 8px;
          background-color: hsl(var(--surface-variant-hsl));
          min-height: 0;
          overflow-y: hidden;

          > .intensity-list-scroller {
            overflow-y: auto;
            height: 100%;
            width: 100%;

            > .intensity-list {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.home-report-box-wrapper {
  display: flex;
  flex-direction: column;

  .home-report-box {
    gap: 4px;
    overflow: hidden;

    &:hover > .report-container {
      max-height: 300px;
      pointer-events: all;
    }

    > .report-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 200px;
      overflow: hidden;
      pointer-events: none;
      transition-property: max-height;
      transition-duration: 0.2s;
      transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
    }
  }
}
</style>
