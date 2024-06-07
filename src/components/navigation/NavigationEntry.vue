<script setup lang="ts">
import MaterialSymbols from "../misc/MaterialSymbols.vue";

import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    icon: string;
    label: string;
    to: string;
    activeOnRootPath?: boolean;
  }>(),
  {
    activeOnRootPath: false,
  }
);

const router = useRouter();
const route = useRoute();
const isActive = computed(() =>
  props.activeOnRootPath
    ? route.path.startsWith(props.to)
    : route.path == props.to
);

const navigate = () => {
  if (isActive.value) {
    router.replace("/");
  } else {
    router.replace(props.to);
  }
};
</script>

<template>
  <div
    v-ripple
    class="navigation-entry"
    :class="{ active: isActive }"
    tabindex="0"
    @click="navigate"
  >
    <MaterialSymbols :icon="icon" />
    <div class="label">{{ label }}</div>
  </div>
</template>

<style scoped>
.navigation-entry {
  position: relative;
  display: grid;
  grid-template-columns: 24px 0fr;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out,
    grid-template-columns 0.5s ease-in-out;
}

.navigation-entry:not(.active):hover {
  background-color: color-mix(in srgb, transparent, var(--p-primary-color) 8%);
}

.active {
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: bold;
}

.label {
  padding: 0 8px;
  white-space: nowrap;
}
</style>
