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
  <div
    class="flex flex-col max-h-full px-2 rounded-lg min-w-64 overflow-y-auto"
  >
    <div
      class="flex items-center gap-2 p-2 text-lg font-bold"
      :class="{ large }"
    >
      <div class="header-title">{{ title }}</div>
      <div v-if="subtitle" class="opacity-60">{{ subtitle }}</div>
    </div>
    <slot />
  </div>
</template>
