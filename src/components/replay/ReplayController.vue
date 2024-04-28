<script setup lang="ts">
import Button from "primevue/button";
import MaterialSymbols from "../misc/MaterialSymbols.vue";
import ProgressBar from "primevue/progressbar";
import Slider from "primevue/slider";

import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  frames: number;
  progress: number;
  frame: number;
  playing: boolean;
  loading: boolean;
}>();

const emit = defineEmits<{
  forward: [];
  replay: [];
  pause: [];
  play: [];
  timeline: [];
  seek: [frame: number];
}>();

const router = useRouter();

const sliderProgress = ref(0);
const syncProgress = ref(true);

watch(
  () => props.frame,
  () => {
    if (syncProgress.value) {
      sliderProgress.value = props.frame;
    }
  }
);

const endReplay = () => {
  router.back();
};
</script>

<template>
  <div class="replay-controller">
    <div class="replay-progress">
      <ProgressBar
        class="progress-bar"
        :class="{ loaded: !loading }"
        :value="loading ? undefined : progress"
        :show-value="false"
      />
      <Slider
        v-if="!loading"
        v-model="sliderProgress"
        class="progress-slider"
        :class="{ loaded: !loading }"
        :min="0"
        :max="frames"
        @slideend="() => emit('seek', sliderProgress)"
      />
    </div>
    <div class="replay-actions">
      <Button class="end-replay-btn" severity="danger" text @click="endReplay">
        <template #icon>
          <MaterialSymbols icon="close" />
        </template>
      </Button>
      <Button severity="secondary" text @click="() => emit('replay')">
        <template #icon>
          <MaterialSymbols icon="replay_10" />
        </template>
      </Button>
      <Button
        severity="primary"
        text
        @click="() => (playing ? emit('pause') : emit('play'))"
      >
        <template #icon>
          <MaterialSymbols :icon="playing ? 'pause' : 'play_arrow'" />
        </template>
      </Button>
      <Button severity="secondary" text @click="() => emit('forward')">
        <template #icon>
          <MaterialSymbols icon="forward_10" />
        </template>
      </Button>
      <Button
        class="open-timeline-btn"
        severity="secondary"
        text
        @click="() => emit('timeline')"
      >
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
  gap: 12px;
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

.progress-slider.loaded {
  background-color: transparent;
}

.progress-bar.loaded {
  background-color: color-mix(
    in srgb,
    var(--p-surface-700),
    var(--p-surface-800)
  );
}

.progress-slider.loaded:deep(> .p-slider-range),
.progress-bar.loaded:deep(> .p-progressbar-value) {
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
