<script setup lang="ts">
import ReplayController from "@/components/replay/ReplayController.vue";

import { onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useRoute, useRouter } from "vue-router";
import { readFile } from "@tauri-apps/plugin-fs";
import { loadAsync } from "jszip";
import type { Events, Frame, RtsEewData } from "./ReplayView";

const toast = useToast();
const route = useRoute();
const router = useRouter();
const isPlaying = ref(true);
const isLoading = ref(true);
const currentFrame = ref(0);
const progress = ref(0);
const replayData = [] as Frame[];
const events = ref<Events[]>([]);

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
        replayData.push({
          type: "rts",
          data: data.rts,
          time: data.rts.time,
        });
      }

      for (const eew of data.eew) {
        if (eew.serial > (eewFlag[eew.id] ?? 0)) {
          eewFlag[eew.id] = eew.serial;

          replayData.push({
            type: "eew",
            data: eew,
            time: +filename,
          });
        }
      }
    }

    replayData.sort((a, b) => a.time - b.time);
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

const play = () => {
  isPlaying.value = true;
};

const pause = () => {
  isPlaying.value = false;
};

const replay = () => {
  if (currentFrame.value > 10) {
    currentFrame.value -= 10;
  } else {
    currentFrame.value = 0;
  }

  progress.value = (currentFrame.value / replayData.length) * 100;
};

const forward = () => {
  if (currentFrame.value < replayData.length - 10) {
    currentFrame.value += 10;
  } else {
    currentFrame.value = replayData.length;
  }

  progress.value = (currentFrame.value / replayData.length) * 100;
};

const seekToFrame = (frame: number) => {
  currentFrame.value = frame;
  progress.value = (currentFrame.value / replayData.length) * 100;
};

onMounted(() => {
  console.log(route.query);
  loadData();
});
</script>

<template>
  <div id="replay">
    <ReplayController
      :frames="replayData.length"
      :frame="currentFrame"
      :progress="progress"
      :playing="isPlaying"
      :loading="isLoading"
      @replay="replay"
      @forward="forward"
      @play="play"
      @pause="pause"
      @seek="seekToFrame"
    />
  </div>
</template>
