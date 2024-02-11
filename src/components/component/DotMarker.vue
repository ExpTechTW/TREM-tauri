<script setup lang="ts">
defineProps<{
  int?: number;
  size: number;
  zIndex: number;
}>();
</script>

<template lang="pug">
.cross(:style="{ height: `${size}px`, width: `${size}px`, zIndex }")
  svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 76" :class="int ? `intensity-${int}` : 'intensity-unknow'" :height="size" :width="size")
    circle.outer(cx="38", cy="38", r="28")
    circle.inner(cx="38", cy="38", r="20")/
</template>

<style lang="scss" scoped>
.cross {
  transition: opacity 0s;
  z-index: 100;

  .red-cross .inner {
    fill: hsl(180deg 100% 60%);
  }

  .red-cross .outer {
    fill: #fff;
  }

  > svg {
    background-color: transparent;
  }
}
</style>
