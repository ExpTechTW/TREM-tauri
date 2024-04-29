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
const isControllerHidden = ref(false);
let idleTimer: number | null = null;

watch(
  () => props.frame,
  () => {
    if (syncProgress.value) {
      sliderProgress.value = props.frame;
    }
  }
);

const slidestart = () => {
  syncProgress.value = false;
};

const slideend = () => {
  syncProgress.value = true;
  emit("seek", sliderProgress.value);
};

const endReplay = () => {
  router.back();
};

const mouseenter = () => {
  isControllerHidden.value = false;
  if (idleTimer != null) {
    window.clearTimeout(idleTimer);
    idleTimer = null;
  }
};

const mouseleave = () => {
  if (idleTimer == null) {
    idleTimer = window.setTimeout(() => {
      isControllerHidden.value = true;
      idleTimer = null;
    }, 5000);
  }
};
</script>

<template>
  <div
    class="replay-controller"
    :class="{ hide: isControllerHidden }"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
  >
    <div class="replay-progress">
      <ProgressBar
        class="progress-bar"
        :class="{ loaded: !loading }"
        :value="progress"
        :mode="loading ? 'indeterminate' : 'determinate'"
        :show-value="false"
      />
      <Slider
        v-if="!loading"
        v-model="sliderProgress"
        class="progress-slider"
        :class="{ loaded: !loading, hide: isControllerHidden }"
        :min="0"
        :max="frames"
        @change="slidestart"
        @slideend="slideend"
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
  transition: bottom 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.replay-controller.hide {
  bottom: -48px;
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

.progress-slider.hide:deep(> .p-slider-handle) {
  opacity: 0;
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
