<script setup lang="ts">
import "@/styles/intensity.css";

withDefaults(
  defineProps<{
    intensity: number | null;
    size?: number;
    borderRadius?: number;
    bold?: boolean;
  }>(),
  {
    size: 48,
    borderRadius: 8,
    bold: true,
  }
);
</script>

<template>
  <div
    class="intensity"
    :class="`intensity-${intensity ?? 'unknown'}`"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${borderRadius}px`,
      fontSize: `${intensity ? (size / 3) * 2 : size / 2}px`,
      fontWeight: bold ? 700 : 400,
    }"
  >
    {{
      intensity
        ? ["0", "1", "2", "3", "4", "5⁻", "5⁺", "6⁻", "6⁺", "7"][intensity]
        : "不明"
    }}
  </div>
</template>

<style scoped>
.intensity {
  display: grid;
  align-items: center;
  justify-content: center;
  letter-spacing: -1px;
}
</style>
