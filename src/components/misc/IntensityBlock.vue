<script setup lang="ts">
import { IntensityBgClass } from "@/helpers/constant";

withDefaults(
  defineProps<{
    intensity: number;
    size?: number;
  }>(),
  {
    size: 20,
  }
);
</script>
<template>
  <div
    class="flex items-center justify-center rounded-md font-semibold border-2"
    :class="[
      IntensityBgClass[intensity],
      intensity == 4 || intensity == 5 ? 'text-black' : 'text-white',
    ]"
    :style="{
      height: `${size}px`,
      width: `${size}px`,
      fontSize: `${(size / 3) * 2}px`,
      letterSpacing: intensity > 4 && intensity < 7 ? `-2px` : '',
    }"
  >
    {{ ["0", "1", "2", "3", "4", "5⁻", "5⁺", "6⁻", "6⁺", "7"][intensity] }}
  </div>
</template>
