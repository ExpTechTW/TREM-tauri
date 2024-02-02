<script setup lang="ts">
import type { PartialReport } from "../../scripts/class/api";
import { extractLocationFromString, toFormattedTimeString } from "../../scripts/helper/utils";
import Chip from "../component/Chip.vue"
import FilledButton from "../component/FilledButton.vue"
defineProps<{ report?: Partial<PartialReport>, hideReport: Function }>();
</script>

<template lang="pug">

.report-box-wrapper
  #report-box.report-box.panel
    .report-box-header
      .report-box-header
        FilledButton(@click="hideReport()")
        #report-source.report-source 交通部中央氣象署
                    
      // 報告標題

      .report-title
        .report-title-container
          span#report-subtitle.report-subtitle {{ report?.no ?? 0 % 1000 ? `編號 ${112085}` : "小區域有感地震"}}
          span#report-title.report-title {{ extractLocationFromString(report?.loc ?? '') }}
        #report-max-intensity.report-max-intensity(:class="`intensity-${report?.int ?? ''}`")

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
        .report-detail-field
          .report-detail-field-icon.material-symbols-rounded schedule
          .report-detail-field-divider
          .report-detail-field-content-container
            .report-detail-field-name 發震時間
            #report-time.report-detail-field-value {{ toFormattedTimeString(report?.time ?? 0) }}
        .report-detail-field
          .report-detail-field-icon.material-symbols-rounded pin_drop
          .report-detail-field-divider
          .report-detail-field-content-container
            .report-detail-field-name 震央位置
            #report-time.report-detail-field-value 宜蘭縣政府南南東方 14.2 公里
        .report-detail-field
          .report-detail-field-icon.material-symbols-rounded point_scan
          .report-detail-field-divider
          .report-detail-field-content-container
            .report-detail-field-name 震央座標
            #report-time.report-detail-field-value
              span.value-unit-pair
                span#report-longitude.field-value 121.83
                span.field-unit °E
              span.value-unit-pair
                span#report-latitude.field-value 24.62
                span.field-unit °N

        .report-detail-field-row
          .report-detail-field
            .report-detail-field-icon.material-symbols-rounded speed
            .report-detail-field-divider
            .report-detail-field-content-container
              .report-detail-field-name 規模
              #report-time.report-detail-field-value
                span.value-unit-pair
                  span.field-unit M#[sub L]
                  #report-magnitude.field-value 4.5
                  
          .report-detail-field
            .report-detail-field-icon.material-symbols-rounded keyboard_double_arrow_down
            .report-detail-field-divider
            .report-detail-field-content-container
              .report-detail-field-name 深度
              #report-time.report-detail-field-value
                span.value-unit-pair
                  #report-depth.field-value 47.4
                  .field-unit ㎞
                  
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
            #report-intensity-all.report-intensity-container
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
      
      > .report-box-header {
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
            opacity: .86;
            line-height: 16px;
            font-size: 14px;
          }

          >.report-title {
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

      > .report-action-container {
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

        .report-detail-field {
          display: flex;
          align-items: center;
          gap: 8px;

          >.report-detail-field-icon {
            width: 24px;
            aspect-ratio: 1;
            opacity: .8;
            font-size: 24px;
          }

          >.report-detail-field-divider {
            width: 2px;
            height: 90%;
            background-color: rgb(255 255 255 / .6);
            border-radius: 2px;
          }

          >.report-detail-field-content-container {
            display: flex;
            flex-direction: column;
            gap: 4px;

            >.report-detail-field-name {
              line-height: 12px;
              font-size: 12px;
              font-weight: 300;
              opacity: .8;
            }

            >.report-detail-field-value {
              display: flex;
              gap: 16px;
              height: 16px;
              line-height: 16px;
              font-family: "Lato", "Noto Sans TC", sans-serif;
              font-size: 16px;
              font-weight: 700;

              .value-unit-pair {
                display: inline-flex;
                align-items: baseline;
                gap: 2px;
              }

              .field-value {
                line-height: 18px;
                font-size: 16px;
              }

              .field-unit {
                line-height: 10px;
                font-size: 10px;
                opacity: .6;
              }
            }
          }
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
                width: 14px;
                aspect-ratio: 1;
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

            > .report-intensity-container {
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

              .report-intensity-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding-right: 8px;
                border-radius: 24px;
                background-color: hsl(var(--background-variant-hsl));

                >.report-intensity-item-intensity {
                  height: 24px;
                  width: 44px;
                  border-radius: 24px;
                  line-height: 24px;
                  font-family: "Open Sans", "Lato", "Noto Sans TC", sans-serif;
                  font-size: 22px;
                  font-weight: 900;
                  text-align: center;
                }

                &.collapsible > .report-intensity-item-location {
                  flex: 1;
                }

                &:has(> .report-intensity-item-location + .report-intensity-item-station) > .report-intensity-item-location {
                  font-weight: 700;
                }

                > .report-intensity-item-location,
                > .report-intensity-item-station {
                  font-size: 13px;
                }
                
                > .report-intensity-collapse {
                  width: 16px;
                  aspect-ratio: 1;
                  font-size: 16px;
                  opacity: .6;
                }
              }

              > .report-intensity-item {
                background-color: hsl(var(--background-hsl));
              }

              .report-intensity-group {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;
                height: 24px;
                overflow: hidden;
                transition: height .2s cubic-bezier(0.2, 0, 0, 1);
                
                &.expanded {
                  height: auto;
                  transition-duration: .4s;
                  transition-timing-function: cubic-bezier(0.05, 0.7, 0.1, 1);

                  > .report-intensity-item > .report-intensity-group-collapse {
                    scale: 1 -1;
                  }
                }

                >.report-intensity-item {
                  cursor: pointer;

                  >.report-intensity-item-location {
                    font-weight: 700;
                  }

                  > .report-intensity-group-collapse {
                    opacity: .6;
                    transition: scale .1s cubic-bezier(0.2, 0, 0, 1);
                  }
                }

                >.report-intensity-member {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  padding-left: 24px;

                  >.report-intensity-item {
                    background-color: hsl(var(--background-hsl));
                  }
                }
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