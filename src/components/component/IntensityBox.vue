<script setup lang="ts">
defineProps<{
  int: number;
}>();
</script>

<template lang="pug">
.intensity-box(:class="`intensity-${int < 0 ? 'unknow' : int}`")
</template>

<style lang="scss" scoped>
.intensity-box {
  display: grid;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: 25%;

  font-family: "Open Sans", sans-serif;
  font-weight: 700;
}
</style>
