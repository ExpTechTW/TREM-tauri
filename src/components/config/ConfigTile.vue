<script setup lang="ts">
import { useSlots } from "vue";

defineProps<{
  disabled?: boolean;
}>();

const slots = useSlots();
</script>

<template>
  <div class="config-tile" :class="{ disabled }" :inert="disabled">
    <div v-if="slots.leading" class="tile-leading">
      <slot name="leading" />
    </div>
    <div class="tile-content">
      <div class="tile-title">
        <slot name="title" />
      </div>
      <div v-if="slots.subtitle" class="tile-subtitle">
        <slot name="subtitle" />
      </div>
    </div>
    <div v-if="slots.trailing" class="tile-trailing">
      <slot name="trailing" />
    </div>
  </div>
</template>

<style scoped>
.config-tile {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 0;
  min-height: 56px;

  --p-c-surface-350: color-mix(
    in lab,
    var(--p-surface-300),
    var(--p-surface-400)
  );
}

.config-tile.disabled {
  opacity: 0.4;
  pointer-events: none;
  cursor: not-allowed;
}

.tile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 360px;
  padding-left: 8px;
}

.tile-leading,
.tile-trailing {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: var(--p-c-surface-350);
}

.tile-subtitle {
  color: var(--t-tertiary-text-color);
  font-size: smaller;
}
</style>
