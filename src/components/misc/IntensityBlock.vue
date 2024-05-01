<script setup lang="ts">
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
    class="intensity-block"
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
.intensity-block {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 600;
  border: 2px solid #fff;
}
</style>
