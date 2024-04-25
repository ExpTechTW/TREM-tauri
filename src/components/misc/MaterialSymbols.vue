<script setup lang="ts">
import "material-symbols/rounded.css";

withDefaults(
  defineProps<{
    icon: string;
    size?: number;
    weight?: number;
    filled?: boolean;
  }>(),
  {
    size: 24,
    weight: 400,
    filled: false,
  }
);
</script>

<template>
  <span
    class="material-symbols-rounded"
    :style="{
      height: `${size}px`,
      width: `${size}px`,
      fontSize: `${size}px`,
      fontVariationSettings: `'FILL' ${+filled}, 'wght' ${weight}`,
    }"
    >{{ icon }}</span
  >
</template>
