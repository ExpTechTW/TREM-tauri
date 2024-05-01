<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    large?: boolean;
  }>(),
  {
    large: false,
  }
);
</script>

<template>
  <div class="panel">
    <div class="panel-header" :class="{ large }">
      <div class="header-title">{{ title }}</div>
      <div v-if="subtitle" class="header-subtitle">{{ subtitle }}</div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  padding: 0 8px;
  border-radius: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  font-size: 18px;
  font-weight: bold;
  color: var(--t-primary-text-color);
}

.header-subtitle {
  opacity: 0.6;
}
</style>
