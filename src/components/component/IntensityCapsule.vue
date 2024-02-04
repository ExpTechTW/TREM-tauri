<script setup lang="ts">
defineProps<{
  int: number;
}>();
</script>
<template lang="pug">
.report-intensity-item-intensity(:class="`intensity-${int}`")
</template>

<style scoped>
.intensity-box {
  display: grid;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: 25%;
}
</style>
