<script setup lang="ts">
import { toFormattedTimeString } from '../../scripts/helper/utils';

defineProps<{
  timestamp: number;
}>();
</script>

<template lang="pug">
.time {{ toFormattedTimeString(timestamp) }}
</template>

<style scoped>
.time {
  position: fixed;
  bottom: 8px;
  left: 8px;
  z-index: 9999;
}
</style>