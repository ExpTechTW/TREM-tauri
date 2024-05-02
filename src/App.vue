<script setup lang="ts">
import HomeView from "./components/view/HomeView.vue";
import TimeDisplay from "./components/component/TimeDisplay.vue";
import MapView from "./components/view/MapView.vue";
import NavigationBar from "./components/component/NavigationBar.vue";
import ReportBox from "./components/view/ReportBox.vue";
import ReportListBox from "./components/view/ReportListBox.vue";

import { inject, onBeforeUnmount, reactive, ref } from "vue";
import { UserAttentionType, getCurrent } from "@tauri-apps/api/window";
import { attachConsole, error, info, trace } from "@tauri-apps/plugin-log";

import {
  ExpTechApi,
  type Report,
  type PartialReport,
  type Rts,
  type Station,
  WebSocketEvent,
  EewSource,
  EewStatus,
  type Eew,
} from "./scripts/class/api";
import { AudioType, type EewEvent } from "./types";
import { Config } from "./scripts/class/config";

import PostalCode from "./assets/json/code.json";
import {
  calculateEpicenterDistance,
  calculateExpectedIntensity,
  calculateLocalExpectedWaveTime,
  calculateWaveRadius,
} from "./scripts/helper/utils";
import { getAudio } from "./scripts/helper/audio";
import JSZip from "jszip";
import { readFile } from "@tauri-apps/plugin-fs";

const unattachConsole = attachConsole();
const webviewWindow = getCurrent();

const config = inject<Config>("config")!;
const api = new ExpTechApi(config.cache.api.key);

const timer: Record<string, number> = {};
const eewTimer: Record<string, number> = {};

const ntp = reactive({
  remote: Date.now(),
  server: Date.now(),
  client: Date.now(),
});
const activeReport = ref<Report>();
const currentView = ref<string>("home");

const stations = ref<Record<string, Station>>({});
const reports = reactive<PartialReport[]>([]);
const eew = reactive<Record<string, EewEvent>>({});
const rts = reactive<Rts>({
  station: {},
  box: {},
  int: [],
  time: Date.now(),
  replay: false,
});

const currentEewIndex = ref<string>();
let isReplaying: boolean = false;

const getAccurateTime = () => {
  return ntp.server + (Date.now() - ntp.client);
};

const updateResources = async () => {
  try {
    const ids = reports.map((r) => r.id);
    const r = (await api.getReports()).filter((r) => !ids.includes(r.id));

    reports.push(...r);
    reports.sort((a, b) => b.time - a.time);
  } catch (err) {
    if (err instanceof Error) {
      error("[API] Error fetching report list.");
      if (err.stack) {
        trace(err.stack);
      }
    }
  }

  try {
    const s = await api.getStations();
    stations.value = s;
  } catch (err) {
    if (err instanceof Error) {
      error("[API] Error fetching station data.");
      if (err.stack) {
        trace(err.stack);
      }
    }
  }
};

updateResources();
timer.reportFetchTimer = window.setInterval(updateResources, 60_000);

const updateRtsEew = async () => {
  if (isReplaying) {
    return;
  }

  api
    .getRts()
    .then((data) => {
      ntp.server = data.time;
      ntp.remote = data.time;
      ntp.client = Date.now();
      api.emit(WebSocketEvent.Rts, data);
    })
    .catch((err) => {
      if (err instanceof Error) {
        error("[API] Error fetching rts data.");
        if (err.stack) {
          trace(err.stack);
        }
      }
    });

  api
    .getEew()
    .then((data) => {
      for (const e of data) {
        api.emit(WebSocketEvent.Eew, e);
      }
    })
    .catch((err) => {
      if (err instanceof Error) {
        error("[API] Error fetching eew data.");
        if (err.stack) {
          trace(err.stack);
        }
      }
    });
};

updateRtsEew();
timer.dataFetchtimer = window.setInterval(updateRtsEew, 1_000);

const setEewIndex = () => {
  const keys = Object.keys(eew);
  if (keys.length) {
    if (currentEewIndex.value) {
      const index = keys.indexOf(currentEewIndex.value);

      if (index + 1 < keys.length) {
        if (keys.at(index + 1) != currentEewIndex.value) {
          currentEewIndex.value = keys.at(index + 1);
        }
        return;
      }
    }

    if (keys[0] != currentEewIndex.value) {
      currentEewIndex.value = keys[0];
    }
  }
};

const resetEew = () => {
  info("[EEW] Cleaning eew states...");

  currentEewIndex.value = undefined;
  window.clearInterval(timer.eewRadiusTimer);
  window.clearInterval(timer.eewIndexTimer);
  delete timer.eewRadiusTimer;
  delete timer.eewIndexTimer;

  for (const id in eew) {
    delete eewTimer[id];
    delete eew[id];
  }

  if (!config.cache.behavior.alwaysOnTop) {
    webviewWindow.setAlwaysOnTop(false);
  }

  webviewWindow.requestUserAttention(null);
};

api.on(WebSocketEvent.Ready, () => {
  info("[API] WebSocket ready, using WebSocket instead of Fetch.");
  window.clearInterval(timer.dataFetchtimer);
  delete timer.dataFetchtimer;
});

api.on(WebSocketEvent.Rts, (r) => {
  if (isReplaying && !r.replay) {
    return;
  }

  r.int ??= [];

  for (const i of r.int) {
    const location = PostalCode[i.code];
    i.area = location.city;
    i.station = location.town;
  }

  Object.assign(rts, r);
});

api.on(WebSocketEvent.Eew, (e) => {
  if (isReplaying && !e.replay) {
    return;
  }
  if ((eew[e.id]?.serial ?? 0) >= e.serial) {
    return;
  }

  console.debug(e);

  const time = getAccurateTime();
  const waveRadius = calculateWaveRadius(time, e.eq.depth, e.eq.time);

  const { intensity } = calculateExpectedIntensity(
    { lat: e.eq.lat, lng: e.eq.lon },
    e.eq.mag,
    e.eq.depth
  );

  const data: EewEvent = {
    r: waveRadius,
    lng: e.eq.lon,
    lat: e.eq.lat,
    location: e.eq.loc,
    magnitude: e.eq.mag,
    depth: e.eq.depth,
    serial: e.serial,
    source: e.author,
    detail: e.author == EewSource.Trem ? e.detail : 1,
    status: e.status,
    int: intensity,
    max: e.eq.max,
    final: !!e.final,
    cancel: eew[e.id]?.cancel || e.status == EewStatus.Cancel,
    time: e.eq.time,
    raw: e,
  };

  if (config.cache.location.area) {
    const area = PostalCode[config.cache.location.area];
    const { surfaceDistance, distance } = calculateEpicenterDistance({
      lat: e.eq.lat,
      lng: e.eq.lon,
    })({ lng: area.lng, lat: area.lat })(e.eq.depth);

    data.surface = surfaceDistance;
    data.distance = distance;
    data.i = intensity[config.cache.location.area];

    let { p, s } = calculateLocalExpectedWaveTime(
      data.distance,
      data.depth,
      data.time
    );

    p = Math.floor((p - time) / 1000);
    s = Math.floor((s - time) / 1000);

    data.t = { p, s };

    if (!timer.expectedWaveTimer) {
      timer.expectedWaveTimer = window.setInterval(() => {
        for (const id in eew) {
          const e = eew[id];
          if (!e.distance) {
            continue;
          }

          let { p, s } = calculateLocalExpectedWaveTime(
            e.distance,
            e.depth,
            e.time
          );

          const time = getAccurateTime();

          p = Math.floor((p - time) / 1000);
          s = Math.floor((s - time) / 1000);

          e.t = { p, s };
        }
      }, 1_000);
    }
  }

  if (
    Object.keys(eew).length == 0 &&
    e.serial == 1 &&
    config.cache.behavior.focusWindowWhenEew
  ) {
    changeView("home");
    webviewWindow.setFocus();
  }

  if (
    !config.cache.behavior.alwaysOnTop &&
    config.cache.behavior.alwaysOnTopWhenEew
  ) {
    webviewWindow.setAlwaysOnTop(true);
  }

  if (eew[e.id]) {
    if (e.serial > eew[e.id].serial) {
      webviewWindow.requestUserAttention(UserAttentionType.Informational);

      if (config.cache.audio.enabled) {
        if (data.cancel) {
          getAudio(config.cache.audio.theme, AudioType.Cancel).play();
        } else {
          getAudio(config.cache.audio.theme, AudioType.Update).play();
        }
      }
    }
  } else {
    webviewWindow.requestUserAttention(UserAttentionType.Critical);

    if (!eewTimer[e.id]) {
      eewTimer[e.id] = window.setTimeout(() => {
        delete eew[e.id];
        delete eewTimer[e.id];

        if (currentEewIndex.value == e.id && Object.keys(eew).length) {
          setEewIndex();
        }
      }, 240_000);
    }

    if (e.author == EewSource.Cwa) {
      if (config.cache.audio.enabled) {
        getAudio(config.cache.audio.theme, AudioType.CwaEew).play();
      }
    } else {
      if (config.cache.audio.enabled) {
        getAudio(config.cache.audio.theme, AudioType.Eew).play();
      }
    }
  }

  eew[e.id] = data;

  if (!currentEewIndex.value) {
    setEewIndex();
  }

  if (!timer.eewIndexTimer) {
    timer.eewIndexTimer = window.setInterval(setEewIndex, 2_000);
  }

  if (!timer.eewRadiusTimer) {
    timer.eewRadiusTimer = window.setInterval(() => {
      if (!Object.keys(eew).length) {
        resetEew();
      }

      for (const id in eew) {
        const e = eew[id];

        eew[id].r = calculateWaveRadius(getAccurateTime(), e.depth, e.time);
      }
    }, 100);
  }
});

api.on(WebSocketEvent.Ntp, ({ time }) => {
  if (!isReplaying) {
    ntp.server = time;
    ntp.client = Date.now();
  }

  ntp.remote = time;
});

api.on(WebSocketEvent.Close, () => {
  if (!timer.dataFetchtimer) {
    info("[API] WebSocket closed, using Fetch.");
    timer.dataFetchtimer = window.setInterval(updateRtsEew, 1_000);
  }
});

const changeView = (view: string) => {
  if (currentView.value == view) {
    currentView.value = "home";
  } else {
    currentView.value = view;
  }
};

const handleHideReportBox = () => {
  currentView.value = "report-list";
};

const changeReport = async (report: PartialReport) => {
  if (!api) {
    return;
  }

  activeReport.value = undefined;
  currentView.value = "report";
  const fullReport = await api?.getReport(report.id);
  activeReport.value = fullReport;
};

document.addEventListener("keydown", (ev) => {
  // Disabling keyboard shortcuts
  if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
    switch (ev.code) {
      case "Digit1":
        changeView("home");
        break;

      case "Digit2":
        changeView("report-list");
        break;

      case "Digit3":
      case "KeyO":
        changeView("setting");
        break;

      case "KeyR":
        location.reload();
        break;

      default:
        ev.preventDefault();
        break;
    }
  } else if (!(ev.ctrlKey && ev.shiftKey && !ev.altKey && ev.code == "KeyI")) {
    ev.preventDefault();
  }
});

const offFileDrop = webviewWindow.listen<{ paths: string[] }>(
  "tauri://file-drop",
  async (e) => {
    if (isReplaying) {
      return;
    }

    if (!e.payload.paths[0].endsWith(".trply")) {
      return;
    }

    isReplaying = true;

    try {
      info(
        `[Replay] Loading replay ${e.payload.paths[0].split(/(\\|\/)/g).pop()}`
      );

      const replayData: { rts: Rts; eew: Eew[]; time: number }[] = [];
      const binary = await readFile(e.payload.paths[0]);
      const zip = await JSZip.loadAsync(binary);

      for (let i = 0, k = Object.keys(zip.files), n = k.length; i < n; i++) {
        const filename = k[i];
        const content = await zip.files[filename].async("string");
        const data: { rts: Rts; eew: Eew[]; time: number } =
          JSON.parse(content);
        data.rts.replay = true;
        data.eew.forEach((e) => (e.replay = true));
        data.time = +filename;
        replayData.push(data);
      }

      const replayLength = replayData.length;
      let replayPercentage = 0;
      info(`[Replay] Loaded ${replayLength} frames.`);

      const emitEvents = () => {
        const current = replayData.shift();

        if (!current) {
          resetEew();
          isReplaying = false;
          ntp.server = ntp.remote;
          ntp.client = Date.now();
          return;
        }

        ntp.server = current.time;
        ntp.client = Date.now();

        api.emit(WebSocketEvent.Rts, current.rts);
        current.eew.forEach((e) => api.emit(WebSocketEvent.Eew, e));

        const newReplayPercentage = ~~(
          (1 - replayData.length / replayLength) *
          10
        );

        if (newReplayPercentage > replayPercentage) {
          info(
            `[Replay] ${`${newReplayPercentage * 10}`.padStart(3, " ")}% [${"#".repeat(newReplayPercentage).padEnd(10, ".")}] | Frame ${replayLength - replayData.length}`
          );
        }

        replayPercentage = newReplayPercentage;

        window.setTimeout(
          emitEvents,
          replayData[0] ? replayData[0].time - current.time : 1_000
        );
      };

      emitEvents();
    } catch (err) {
      isReplaying = false;
      if (err instanceof Error) {
        error("[Replay] Exception thrown while loading replay.");
        if (err.stack) {
          trace(err.stack);
        }
      }
    }
  }
);

const offCloseRequest = webviewWindow.onCloseRequested((event) => {
  if (config.cache.system.closeToTray) {
    event.preventDefault();
    webviewWindow.hide();
  }
});

onBeforeUnmount(() => {
  console.log("unmount");

  offFileDrop.then((f) => f());
  offCloseRequest.then((f) => f());
  unattachConsole.then((f) => f());
  window.clearInterval(timer.reportFetchTimer);
  window.clearInterval(timer.dataFetchtimer);
  api.destroy();
});
</script>

<template lang="pug">
NavigationBar(:current-view="currentView", :change-view="changeView")
TimeDisplay(:timestamp="ntp.server")
MapView(:current-view="currentView", :reports="reports", :active-report="activeReport", :stations="stations", :rts="rts", :eew="eew", :current-eew-index="currentEewIndex", :change-report="changeReport")
HomeView(:current-view="currentView", :stations="stations", :rts="rts", :eew="eew", :current-eew-index="currentEewIndex", :reports="reports", :change-report="changeReport", :change-view="changeView")
ReportBox(:current-view="currentView", :report="activeReport", :handle-hide-report-box="handleHideReportBox")
ReportListBox(:current-view="currentView", :reports="reports", :change-report="changeReport")
</template>

<style lang="scss" scoped></style>
