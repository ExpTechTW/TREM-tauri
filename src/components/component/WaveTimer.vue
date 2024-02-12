<script setup lang="ts">
import type { EewEvent } from "../../types";

defineProps<{
  eew: EewEvent;
  index: number;
}>();
</script>

<template lang="pug">
.local-box(v-if="eew.t")
  .local-title 所在地預估 
  .local-container 
    .local-intensity(:class="`intensity-${eew.i}`")
    .wave-timer-container 
      .wave-timer 
        .wave-timer-name P波 
        .wave-timer-value(v-if="eew.detail") {{ (eew.t.p > 0) ? eew.t.p : "抵達" }} 
        .wave-timer-value(v-else) 未知 
      .wave-timer 
        .wave-timer-name S波 
        .wave-timer-value(v-if="eew.detail") {{ (eew.t.s > 0) ? eew.t.s : "抵達" }} 
        .wave-timer-value(v-else) 未知 
    .local-number {{ index }} 
</template>

<style lang="scss">
.local-box {
  display: flex;
  gap: 8px;
  padding: 8px;
  padding-left: 12px;
  border-radius: 20px;
  background-color: #383838;
  color: #fff;

  > .local-title {
    opacity: 0.6;
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-size: 12px;
  }

  > .local-container {
    position: relative;
    flex: 1;
    display: flex;
    gap: 8px;
    border-radius: 12px;
    background-color: #505050;

    > .local-intensity {
      width: 44px;
      aspect-ratio: 1;
      padding: 8px;
      border-radius: inherit;
      box-shadow: 4px 0 4px rgb(0 0 0 / 20%);
      line-height: 44px;
      font-family: "Open Sans", sans-serif;
      font-size: 44px;
      font-weight: 800;
      text-align: center;
    }

    > .wave-timer-container {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;

      > .wave-timer {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 4px;

        > .wave-timer-name {
          font-size: 14px;
          opacity: 0.6;
        }

        > .wave-timer-value {
          line-height: 26px;
          font-size: 26px;
          font-weight: 700;
          text-align: center;
        }
      }
    }

    > .local-number {
      position: absolute;
      right: 0;
      translate: 25% -25%;
      width: 20px;
      aspect-ratio: 1;
      border-radius: 10px;
      background-color: #ccc;
      color: #000;
      text-align: center;
      line-height: 20px;
      font-size: 12px;
      font-weight: 700;
    }
  }
}
</style>
