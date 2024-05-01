<script setup lang="ts">
import TimeDisplay from "@/components/misc/TimeDisplay.vue";
import ReplayController from "@/components/replay/ReplayController.vue";
import RtsColorLegend from "@/components/map/RtsColorLegend.vue";
import RtsMarker from "@/components/map/RtsMarker.vue";

import { computed, onMounted, onUnmounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useRoute, useRouter } from "vue-router";
import { readFile } from "@tauri-apps/plugin-fs";
import { loadAsync } from "jszip";
import { useStationStore } from "@/stores/station_store";
import { playSound } from "@/helpers/sound";
import { roundIntensity, toFormattedTimeString } from "@/helpers/utils";
import { EewSource, EewType } from "@exptechtw/api-wrapper";
import type { Events, Frame, RtsEewData, RtsFrame } from "./ReplayView";
import EewMarker from "@/components/map/EewMarker.vue";

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

const currentTime = computed<number | undefined>(
  () => replayData.value[currentFrame.value]?.time
);

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

const currentEewState = computed((): EewType[] => {
  const data = [] as EewType[];
  let current = currentTime.value;
  if (!replayData.value.length || !current) return data;

  let flag = {} as Record<string, EewType>;

  for (let i = 0, n = currentFrame.value; i <= n; i++) {
    const f = replayData.value[i];

    if (f.type != "eew") continue;

    flag[f.data.id] = f.data;
  }

  return Object.values(flag).filter((v) => current - v.eq.time < 120_000);
});

const loadData = async () => {
  try {
    const binary = await readFile(route.query.path as string);
    const zip = await loadAsync(binary);
    let maxInt = 0;

    for (let i = 0, k = Object.keys(zip.files), n = k.length; i < n; i++) {
      const filename = k[i];
      const content = await zip.files[filename].async("string");
      const data = JSON.parse(content) as RtsEewData;

      if (data.rts.time) {
        const sound = [];
        let frameMaxInt = 0;

        for (const sid in data.rts.station) {
          const s = data.rts.station[sid];
          const int = roundIntensity(s.I);
          if (s.alert && int > frameMaxInt) {
            frameMaxInt = int;
          }
        }

        if (frameMaxInt > maxInt) {
          maxInt = frameMaxInt;
          sound.push(`intensity${maxInt}`);
        }

        replayData.value.push({
          type: "rts",
          data: data.rts,
          time: data.rts.time,
          sound: sound,
        });
      }

      const eewFlag = {} as Record<string, number>;

      for (const eew of data.eew) {
        const sound = [];

        if (eew.serial == 1 && !eewFlag[eew.id]) {
          eewFlag[eew.id] = eew.serial;
          sound.push(eew.author);
        } else if (eew.author == "cwa") {
          sound.push("update");
        }

        replayData.value.push({
          type: "eew",
          data: eew,
          time: +filename,
          sound,
        });
      }
    }

    replayData.value.sort((a, b) => a.time - b.time);

    const eewFlag = {} as Record<string, number>;

    for (let i = 0, n = replayData.value.length; i < n; i++) {
      const f = replayData.value[i];

      if (f.type != "eew") continue;

      const data = f.data;

      if (data.serial > (eewFlag[data.id] ?? 0)) {
        eewFlag[data.id] = data.serial;

        if (data.serial == 1) {
          const type =
            data.author == EewSource.Trem && data.detail == 0
              ? "nsspe"
              : f.data.author;

          events.value.push({
            type,
            frame: i,
            label: `${
              toFormattedTimeString(f.time).split(" ")[1]
            } ${type.toUpperCase()} ${
              type != "nsspe" ? "地震速報" : ""
            }`.trim(),
          });
        }
      }
    }

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

const playFrame = (index: number) => {
  progress.value = (currentFrame.value / (replayData.value.length - 1)) * 100;

  const f = replayData.value[index];

  for (const soundName of f.sound) {
    playSound(soundName);
  }
};

const scheduleNextFrame = () => {
  const current = replayData.value[currentFrame.value];
  const next = replayData.value[currentFrame.value + 1];

  if (next) {
    if (playerTimer == null) {
      playerTimer = window.setTimeout(() => {
        if (isPlaying.value) {
          playFrame(++currentFrame.value);
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
};

const endReplay = () => {
  router.back();
};

const keydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case "j":
    case "ArrowLeft": {
      e.preventDefault();
      replay();
      break;
    }

    case "l":
    case "ArrowRight": {
      e.preventDefault();
      forward();
      break;
    }

    case "k":
    case " ": {
      e.preventDefault();

      if (isPlaying.value) {
        pause();
      } else {
        resume();
      }

      break;
    }

    case "Escape": {
      e.preventDefault();
      endReplay();
      break;
    }

    default:
      break;
  }
};

onMounted(() => {
  loadData().then(() => {
    scheduleNextFrame();
  });

  document.addEventListener("keydown", keydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", keydown);
});
</script>

<template>
  <div id="replay">
    <ReplayController
      :frame="currentFrame"
      :progress="progress"
      :playing="isPlaying"
      :loading="isLoading"
      :frames="replayData.length - 1"
      :events="events"
      @replay="replay"
      @forward="forward"
      @play="resume"
      @pause="pause"
      @seek="seekToFrame"
      @end="endReplay"
    />
    <template v-if="stationStore.value">
      <template v-for="(s, id) in stationStore.value">
        <RtsMarker
          :id="id"
          :station="s"
          :lnglat="[s.info[0].lon, s.info[0].lat]"
          :rts="currentRtsFrame?.data?.station?.[id]"
          :hideZero="!!currentEewState.length"
        />
      </template>
    </template>
    <RtsColorLegend id="rts-color-legend" />
    <TimeDisplay v-if="currentTime" :time="currentTime" />
    <template v-if="currentTime" v-for="eew in currentEewState" :key="eew.id">
      <EewMarker :eew="eew" :time="currentTime" />
    </template>
  </div>
</template>

<style scoped>
.rts-color-legend {
  position: absolute;
  bottom: 8px;
  right: 8px;
}
</style>
