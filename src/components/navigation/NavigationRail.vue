<script setup lang="ts">
import NavigationEntry from "./NavigationEntry.vue";

defineProps<{
  expanded: boolean;
}>();
</script>

<template>
  <div class="navigation-rail" :class="{ expanded }">
    <NavigationEntry :icon="`\uf64f`" label="地震報告" to="/report" />
    <NavigationEntry :icon="`\ue8b8`" label="設定" to="/config" />
    <NavigationEntry
      :icon="`\ue7fd`"
      label="帳號"
      to="/account"
      active-on-root-path
    />
  </div>
</template>

<style scoped>
.navigation-rail {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 40px;
}

.navigation-rail.expanded {
  max-width: 200px;
}
</style>
