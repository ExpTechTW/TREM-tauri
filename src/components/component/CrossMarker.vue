<script setup lang="ts">
defineProps<{
  int?: number;
  size: number;
}>();
</script>

<template lang="pug">
.cross
  svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 76" :class="int ? `intensity-${int}` : 'red-cross'" :height="size" :width="size")
    path.cross-inner(d="M59 73a3 3 0 0 1-2-1L38 53 19 72a3 3 0 0 1-4 0L4 61a3 3 0 0 1 0-4l19-19L4 19a3 3 0 0 1 0-4L15 4a3 3 0 0 1 4 0l19 19L57 4a3 3 0 0 1 2-1 3 3 0 0 1 2 1l11 11a3 3 0 0 1 0 4L53 38l19 19a3 3 0 0 1 0 4L61 72a3 3 0 0 1-2 1Z")/
    path.cross-outer(d="m59 6 11 11-21 21 21 21-11 11-21-21-21 21L6 59l21-21L6 17 17 6l21 21L59 6m0-6a6 6 0 0 0-4 2L38 19 21 2a6 6 0 0 0-4-2 6 6 0 0 0-5 2L2 12a6 6 0 0 0 0 9l17 17L2 55a6 6 0 0 0 0 9l10 10a6 6 0 0 0 9 0l17-17 17 17a6 6 0 0 0 9 0l10-10a6 6 0 0 0 0-9L57 38l17-17a6 6 0 0 0 0-9L64 2a6 6 0 0 0-5-2Z")/
</template>

<style scoped>
.cross {
  z-index: 100;

  .red-cross .cross-inner {
    fill: #f22;
  }

  .red-cross .cross-outer {
    fill: #fff;
  }

  >svg {
    background-color: transparent;
  }
}
</style>