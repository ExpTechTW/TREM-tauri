<script setup lang="ts">
import Button from "primevue/button";
import MaterialSymbols from "../misc/MaterialSymbols.vue";
import ProgressBar from "primevue/progressbar";
import Slider from "primevue/slider";

import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const progress = ref(15);
const sliderProgress = ref(15);

const endReplay = () => {
  router.back();
};
</script>

<template>
  <div class="replay-controller">
    <div class="replay-progress">
      <ProgressBar class="progress-bar" :value="progress" :show-value="false" />
      <Slider v-model="sliderProgress" class="progress-slider" />
    </div>
    <div class="replay-actions">
      <Button class="end-replay-btn" severity="danger" text @click="endReplay">
        <template #icon>
          <MaterialSymbols icon="close" />
        </template>
      </Button>
      <Button severity="secondary" text>
        <template #icon>
          <MaterialSymbols icon="replay_10" />
        </template>
      </Button>
      <Button severity="primary" text>
        <template #icon>
          <MaterialSymbols icon="play_arrow" />
        </template>
      </Button>
      <Button severity="secondary" text>
        <template #icon>
          <MaterialSymbols icon="forward_10" />
        </template>
      </Button>
      <Button class="open-timeline-btn" severity="secondary" text>
        <template #icon>
          <MaterialSymbols icon="animation" />
        </template>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.replay-controller {
  position: absolute;
  bottom: 8px;
  left: 50%;
  width: 30svw;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 8px 4px 8px;
  border-radius: 8px;
  translate: -50%;
  border: 1px solid var(--p-surface-600);
  background-color: color-mix(in srgb, transparent, var(--p-surface-700) 85%);
  z-index: 900;
  pointer-events: all;
}

.replay-progress {
  position: relative;
}

.replay-actions {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 4px;
}

.progress-bar,
.progress-slider {
  position: absolute;
  top: 0;
  height: 3px;
  width: 100%;
}

.progress-slider {
  background-color: transparent;
}

.progress-bar {
  background-color: color-mix(
    in srgb,
    var(--p-surface-700),
    var(--p-surface-800)
  );
}

.progress-slider:deep(> .p-slider-range),
.progress-bar:deep(> .p-progressbar-value) {
  background-color: color-mix(
    in srgb,
    transparent,
    var(--p-progressbar-value-background)
  );
}

.end-replay-btn {
  position: absolute;
  left: 0;
}

.open-timeline-btn {
  position: absolute;
  right: 0;
}
</style>
