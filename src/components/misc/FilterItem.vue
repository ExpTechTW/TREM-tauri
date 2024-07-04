<script setup lang="ts">
defineProps<{
  label: string;
  for: string;
}>();
</script>

<template>
  <label class="flex items-center" :for="$props.for">
    <div class="flex-1 text-sm">{{ label }}</div>
    <slot />
  </label>
</template>
