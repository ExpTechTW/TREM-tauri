<script setup lang="ts">
import ReplayController from "@/components/replay/ReplayController.vue";

import { computed, onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useRoute, useRouter } from "vue-router";
import { readFile } from "@tauri-apps/plugin-fs";
import { loadAsync } from "jszip";
import type { Events, Frame, RtsEewData, RtsFrame } from "./ReplayView";
import { useStationStore } from "@/stores/station_store";
import RtsMarker from "@/components/map/RtsMarker.vue";
import RtsColorLegend from "@/components/map/RtsColorLegend.vue";

const toast = useToast();
const route = useRoute();
const router = useRouter();
const stationStore = useStationStore();

const isPlaying = ref(true);
const isLoading = ref(true);
const currentFrame = ref(0);
const progress = ref(0);
const events = ref<Events[]>([]);
const replayData = ref<Frame[]>([]);
let playerTimer: number | null = null;
let idleTimer: number | null = null;

const currentRtsFrame = computed((): RtsFrame | undefined => {
  if (!replayData.value.length) return;

  let index = currentFrame.value;
  let frame = replayData.value[index];

  if (frame.type == "rts") {
    return frame;
  }

  while (index >= 0) {
    index--;
    frame = replayData.value[index];
    if (frame.type == "rts") {
      return frame;
    }
  }
});

const loadData = async () => {
  try {
    const binary = await readFile(route.query.path as string);
    const zip = await loadAsync(binary);
    const eewFlag = {} as Record<string, number>;

    for (let i = 0, k = Object.keys(zip.files), n = k.length; i < n; i++) {
      const filename = k[i];
      const content = await zip.files[filename].async("string");
      const data = JSON.parse(content) as RtsEewData;

      if (data.rts.time) {
        replayData.value.push({
          type: "rts",
          data: data.rts,
          time: data.rts.time,
        });
      }

      for (const eew of data.eew) {
        if (eew.serial > (eewFlag[eew.id] ?? 0)) {
          eewFlag[eew.id] = eew.serial;

          replayData.value.push({
            type: "eew",
            data: eew,
            time: +filename,
          });
        }
      }
    }

    replayData.value.sort((a, b) => a.time - b.time);
    console.log(replayData);

    isLoading.value = false;
  } catch (error) {
    toast.add({
      summary: "解析重播檔時發生錯誤",
      detail: `${error}`,
      severity: "error",
      life: 6000,
    });

    router.back();
  }
};

const scheduleNextFrame = () => {
  const current = replayData.value[currentFrame.value];
  const next = replayData.value[currentFrame.value + 1];

  if (next) {
    if (playerTimer == null) {
      playerTimer = window.setTimeout(() => {
        if (isPlaying.value) {
          currentFrame.value++;
          progress.value =
            (currentFrame.value / (replayData.value.length - 1)) * 100;
          playerTimer = null;
          scheduleNextFrame();
        } else {
          if (playerTimer != null) {
            window.clearTimeout(playerTimer);
            playerTimer = null;
          }
        }
      }, next.time - current.time);
    }
  } else {
    pause();
  }
};

const resume = () => {
  isPlaying.value = true;

  if (progress.value == 100) {
    currentFrame.value = 0;
    progress.value = 0;
  }

  scheduleNextFrame();
};

const pause = () => {
  isPlaying.value = false;
  if (playerTimer != null) {
    window.clearTimeout(playerTimer);
    playerTimer = null;
  }
};

const replay = () => {
  if (currentFrame.value > 10) {
    currentFrame.value -= 10;
  } else {
    currentFrame.value = 0;
  }

  progress.value = (currentFrame.value / (replayData.value.length - 1)) * 100;
};

const forward = () => {
  if (currentFrame.value < replayData.value.length - 10) {
    currentFrame.value += 10;
  } else {
    currentFrame.value = replayData.value.length - 1;
  }

  progress.value = (currentFrame.value / (replayData.value.length - 1)) * 100;
};

const seekToFrame = (frame: number) => {
  currentFrame.value = frame;
  progress.value = (currentFrame.value / (replayData.value.length - 1)) * 100;
  console.log(currentFrame.value);
  console.log(currentRtsFrame.value);
};

onMounted(() => {
  loadData().then(() => {
    scheduleNextFrame();
  });
});
</script>

<template>
  <div id="replay">
    <ReplayController
      :frames="replayData.length - 1"
      :frame="currentFrame"
      :progress="progress"
      :playing="isPlaying"
      :loading="isLoading"
      @replay="replay"
      @forward="forward"
      @play="resume"
      @pause="pause"
      @seek="seekToFrame"
    />
    <template v-if="stationStore.value" v-for="(s, id) in stationStore.value">
      <RtsMarker
        :id="id"
        :station="s"
        :lnglat="[s.info[0].lon, s.info[0].lat]"
        :rts="currentRtsFrame?.data?.station?.[id]"
      />
    </template>
    <RtsColorLegend id="rts-color-legend" />
  </div>
</template>

<style scoped>
.rts-color-legend {
  position: absolute;
  bottom: 8px;
  right: 8px;
}
</style>
