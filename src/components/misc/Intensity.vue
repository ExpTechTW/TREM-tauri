<script setup lang="ts">
import { IntensityBgClass } from "@/helpers/constant";
import "@/styles/intensity.css";

withDefaults(
  defineProps<{
    intensity: number | null;
    size?: number;
    border?: boolean;
    borderRadius?: number;
    bold?: boolean;
  }>(),
  {
    size: 48,
    border: false,
    borderRadius: 8,
    bold: true,
  }
);

const colors = [
  IntensityBgClass,
  [
    "outline-intensity-0",
    "outline-intensity-1",
    "outline-intensity-2",
    "outline-intensity-3",
    "outline-intensity-4",
    "outline-intensity-5",
    "outline-intensity-6",
    "outline-intensity-7",
    "outline-intensity-8",
    "outline-intensity-9",
  ],
];
</script>

<template>
  <div
    class="grid items-center justify-center flex-shrink-0 tracking-tight"
    :class="[
      colors[+border][intensity ?? 10],
      border ? `outline` : '',
      (intensity == 4 || intensity == 5) && !border
        ? 'text-black'
        : 'text-white',
    ]"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${borderRadius}px`,
      fontSize: `${intensity != null ? size / 2 : size / 3}px`,
      fontWeight: bold ? 700 : 400,
    }"
  >
    {{
      intensity != null
        ? ["0", "1", "2", "3", "4", "5⁻", "5⁺", "6⁻", "6⁺", "7"][intensity]
        : "不明"
    }}
  </div>
</template>
