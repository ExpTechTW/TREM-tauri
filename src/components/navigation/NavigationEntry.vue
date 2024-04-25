<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import MaterialSymbols from "../misc/MaterialSymbols.vue";
import { computed } from "vue";

const props = defineProps<{
  icon: string;
  label: string;
  to: string;
}>();

const router = useRouter();
const route = useRoute();
const isActive = computed(() => route.path == props.to);

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
  background-color: var(--p-highlight-background);
}

.active {
  background-color: var(--p-primary-color);
  color: var(--p-primary-inverse-color);
  font-weight: bold;
}

.label {
  padding: 0 8px;
  white-space: nowrap;
}
</style>
