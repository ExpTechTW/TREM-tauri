<script setup lang="ts">
import Chip from "../component/Chip.vue";
import FieldValueUnitPair from "../component/FieldValueUnitPair.vue";
import FilledButton from "../component/FilledButton.vue";
import ReportDetailField from "../component/ReportDetailField.vue";
import ReportIntensityGroup from "../component/ReportIntensityGroup.vue";

import type { Report } from "../../scripts/class/api";
import { extractLocationFromString, toFormattedTimeString } from "../../scripts/helper/utils";
import ReportIntensityItem from "../component/ReportIntensityItem.vue";

defineProps<{
  report?: Report,
  handleHideReportBox: () => void;
  isReportBoxShown: boolean;
}>();
</script>

<template lang="pug">
.report-box-wrapper
  #report-box.report-box.panel(:class="{ show: isReportBoxShown }")
    .report-box-header
      .report-box-header
        FilledButton(@click="handleHideReportBox")
        #report-source.report-source 交通部中央氣象署

      // 報告標題

      .report-title
        .report-title-container
          .report-subtitle.skeleton(:style="report?.no ? '' : 'max-width: 40%'") {{ report?.no ? report.no % 1000 ? `編號 ${report.no}` : "小區域有感地震" : ""}}
          .report-title.skeleton(:style="report?.no ? '' : 'max-width: 80%'") {{ extractLocationFromString(report?.loc ?? "") }}
        #report-max-intensity.report-max-intensity(:class="`intensity-${report?.int ?? 'unknow'}`")

      .report-action-container
        Chip.report-action-chip
          template(#icon) replay
          template(#label) 重播
        Chip.report-action-chip
          template(#icon) captive_portal
          template(#label) 報告頁面
        Chip.report-action-chip
          template(#icon) content_copy
          template(#label) 複製

    .report-box-body
      // 報告資訊
      .report-detail
        ReportDetailField(:style="report?.time ? '' : 'max-width: 70%'")
          template(#icon) schedule
          template(#name) 發震時間
          template(#value, v-if="report?.time") {{ toFormattedTimeString(report.time) }}
        ReportDetailField(:style="report?.loc ? '' : 'max-width: 85%'")
          template(#icon) pin_drop
          template(#name) 震央位置
          template(#value, v-if="report?.loc") {{ report.loc.substring(0, report.loc.indexOf("(")).trim() }}
        ReportDetailField(:style="report?.lon != undefined ? '' : 'max-width: 55%'")
          template(#icon) point_scan
          template(#name) 震央座標
          template(#value, v-if="report?.lat != undefined && report?.lon != undefined")
            FieldValueUnitPair
              template(#value) {{ report.lon }}
              template(#trailing-unit) {{ report.lon ? report.lon > 0 ? "°E" : "°W" : "°" }}
            FieldValueUnitPair
              template(#value) {{ report.lat }}
              template(#trailing-unit) {{ report.lat ? report.lat > 0 ? "°N" : "°S" : "°" }}
        .report-detail-field-row
          ReportDetailField(:style="report?.lon != undefined ? '' : 'max-width: 60%'")
            template(#icon) speed
            template(#name) 規模
            template(#value, v-if="report?.mag != undefined")
              FieldValueUnitPair
                template(#leading-unit) M#[sub L]
                template(#value) {{ report.mag }}
          ReportDetailField(:style="report?.lon != undefined ? '' : 'max-width: 60%'")
            template(#icon) keyboard_double_arrow_down
            template(#name) 深度
            template(#value, v-if="report?.depth != undefined")
              FieldValueUnitPair
                template(#value) {{ report.depth }}
                template(#trailing-unit) ㎞


      // 各地最大震度

      .report-intensity-list
        .report-intensity-list-header
          .report-intensity-list-title 各地最大震度
          .report-intensity-sort-btn-container
            label.report-intensity-sort-btn(for="report-intensity-sort-group")
              input#report-intensity-sort-group(type="radio", name="report-intensity-sort", title="依縣市分組", checked)
              span.report-intensity-sort-btn-icon.material-symbols-rounded category
            label.report-intensity-sort-btn(for="report-intensity-sort-intensity")
              input#report-intensity-sort-intensity(type="radio", name="report-intensity-sort", title="依震度排序")
              span.report-intensity-sort-btn-icon.material-symbols-rounded swap_vert

        .report-intensity-list-scrollview
          .report-intensity-list-scroller
            #report-intensity-grouped.report-intensity-container
              ReportIntensityGroup(v-for="area in report?.list" :area="area")
            #report-intensity-all.report-intensity-container
              ReportIntensityItem(v-if="report?.list" v-for="station in report.list.flatMap(v=>v.stations.map(s=>({...s,area: v.area })))" :station="station")
</template>

<style scoped>
.report-box-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
  bottom: 8px;
  display: flex;
  flex-direction: column;
  width: 20vw;
  min-width: 320px;
  overflow: hidden;
  pointer-events: none;

  .report-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    border-radius: 20px;
    background-color: hsl(var(--surface-hsl));
    color: #fff;
    white-space: nowrap;
    text-rendering: optimizeLegibility;
    pointer-events: all;
    z-index: 1001;

    /* animation */
    opacity: 0;
    translate: 100%;
    transition-property: opacity, translate;
    transition-duration: .2s;
    transition-timing-function: cubic-bezier(0.3, 0, 0.8, 0.15);

    &.show {
      opacity: 1;
      translate: 0;
      transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);
    }

    >.report-box-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border-radius: 12px;
      background-color: hsl(var(--background-variant-hsl));

      >.report-box-header {
        display: flex;

        >.report-source {
          flex: 1;
          opacity: .6;
          line-height: 32px;
          font-size: 14px;
          font-weight: 300;
          text-align: right;
        }
      }

      >.report-title {
        display: flex;
        align-items: center;
        padding-left: 4px;
        border-radius: 12px;

        >.report-title-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: "Lato", "Noto Sans TC", sans-serif;

          >.report-subtitle {
            height: 16px;
            opacity: .86;
            line-height: 16px;
            font-size: 14px;
          }

          >.report-title {
            height: 32px;
            line-height: 32px;
            font-size: 28px;
            font-weight: 900;
          }
        }

        >.report-max-intensity {
          width: 64px;
          aspect-ratio: 1;
          border-radius: 12px;
          line-height: 64px;
          font-family: "Open Sans", "Lato", "Noto Sans TC", sans-serif;
          font-size: 48px;
          font-weight: 900;
          text-align: center;
        }
      }

      >.report-action-container {
        display: flex;
        gap: 8px;
      }
    }

    >.report-box-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 0;
      padding: 8px;

      >.report-detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 0 8px;

        >.report-detail-field-row {
          display: grid;
          grid-auto-flow: column;
        }
      }

      >.report-intensity-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 0;

        &:has(.report-intensity-container:empty) {
          height: 0;
          opacity: 0;
          overflow: hidden;
          pointer-events: none;
        }

        >.report-intensity-list-header {
          display: flex;
          align-items: center;
          padding: 0 8px;

          >.report-intensity-list-title {
            flex: 1;
            font-size: 12px;
          }

          >.report-intensity-sort-btn-container {
            display: flex;
            gap: 4px;
            padding: 2px;
            border-radius: 8px;
            background-color: hsl(var(--background-variant-hsl));

            >.report-intensity-sort-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 14px;
              height: 14px;
              padding: 2px;
              border-radius: 4px;
              background-color: transparent;
              cursor: pointer;
              transition: background-color .1s cubic-bezier(0.2, 0, 0, 1),
                opacity .1s cubic-bezier(0.2, 0, 0, 1);

              >input {
                display: none;
              }

              >.report-intensity-sort-btn-icon {
                color: hsl(0deg 0% 100% / .5);
                font-size: 14px;
                transition: color .1s cubic-bezier(0.2, 0, 0, 1);
              }

              &:has(input:checked) {
                background-color: #D9D9D9;

                >.report-intensity-sort-btn-icon {
                  color: hsl(var(--surface-variant-hsl));
                }
              }

              &:active {
                opacity: .6;
              }
            }
          }
        }

        >.report-intensity-list-scrollview {
          display: flex;
          flex-direction: column;
          min-height: 0;
          padding: 8px;
          border-radius: 16px;
          background-color: hsl(var(--surface-variant-hsl));

          &:hover>.report-intensity-list-scroller {
            overflow-y: auto;
            padding-right: 4px;
          }

          >.report-intensity-list-scroller {
            position: relative;
            min-height: 0;
            overflow: hidden;

            &::-webkit-scrollbar-track {
              background-color: hsl(var(--background-variant-hsl));
            }

            &::-webkit-scrollbar-button {
              background-color: transparent;
              height: 4px;
            }

            >.report-intensity-container {
              display: flex;
              flex-direction: column;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              min-height: 0;
              max-height: 100%;
              opacity: 0;
              overflow: hidden;
              pointer-events: none;
              transition-property: opacity, translate;
              transition-duration: .2s;
              transition-timing-function: cubic-bezier(0.2, 0, 0, 1);

              &#report-intensity-grouped {
                gap: 12px;
                translate: -10%;
              }

              &#report-intensity-all {
                gap: 8px;
                translate: 10%;
              }

              >.report-intensity-item {
                background-color: hsl(var(--background-hsl));
              }
            }
          }
        }

        &:has(#report-intensity-sort-group:checked) #report-intensity-grouped,
        &:has(#report-intensity-sort-intensity:checked) #report-intensity-all {
          opacity: 1;
          position: relative;
          pointer-events: all;
          max-height: unset;
          overflow: visible;
          translate: 0;
          transition-delay: .05s, 0s;
        }
      }
    }
  }
}
</style>