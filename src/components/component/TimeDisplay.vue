<script setup lang="ts">
import { toFormattedTimeString } from "../../scripts/helper/utils";

defineProps<{
  timestamp: number;
}>();
</script>

<template lang="pug">
.time(:class="{ desynced: (Date.now() - timestamp) > 5000 }") {{ toFormattedTimeString(timestamp) }}
</template>

<style lang="scss" scoped>
.time {
  position: fixed;
  bottom: 8px;
  left: 8px;
  z-index: 9999;

  &.desynced {
    color: hsl(48deg 100% 50%);
  }
}
</style>
