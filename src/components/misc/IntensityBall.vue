<script setup lang="ts">
withDefaults(
  defineProps<{
    intensity: number;
    size?: number;
    zIndex?: number;
  }>(),
  {
    size: 20,
  }
);
</script>
<template>
  <div
    class="intensity-ball"
    :class="[`intensity-${intensity}`]"
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

<style scoped>
.intensity-ball {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  font-weight: 600;
  border: 2px solid #fff;
  transition: background-color 0.1s ease-out;
}
</style>
