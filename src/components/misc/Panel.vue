<script setup lang="ts">
import MaterialSymbols from "@/components/misc/MaterialSymbols.vue";
import Panel from "primevue/panel";

defineProps<{
  title: string;
  titleIcon?: string;
  collapsed?: boolean;
}>();
</script>

<template>
  <Panel class="panel" toggleable :collapsed="collapsed">
    <template #header>
      <div class="panel-header">
        <MaterialSymbols v-if="titleIcon" :icon="titleIcon" :size="22" />
        <span>{{ title }}</span>
      </div>
    </template>
    <template #togglericon="{ collapsed }">
      <div class="toggler-icon" :class="{ collapsed }">
        <MaterialSymbols icon="arrow_drop_down" />
      </div>
    </template>
    <slot />
  </Panel>
</template>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}

.toggler-icon {
  display: grid;
  align-items: center;
  justify-content: center;
  rotate: 180deg;
  transition: rotate 0.2s ease-in-out;
}

.toggler-icon.collapsed {
  rotate: 0deg;
}
</style>
