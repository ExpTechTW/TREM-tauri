import App from "./App.vue";

import {
  enable as enableAutoStart,
  disable as disableAutoStart,
  isEnabled as isAutoStartEnabled,
} from "@tauri-apps/plugin-autostart";
import { createApp, reactive, ref } from "vue";
import { UserAttentionType, getCurrent } from "@tauri-apps/api/window";
import { getMatches } from "@tauri-apps/plugin-cli";
import { readFile } from "@tauri-apps/plugin-fs";
import JSZip from "jszip";

import type { Station, PartialReport, Rts, Eew } from "./scripts/class/api";
import type { DefaultConfigSchema, EewEvent } from "./types";
import {
  calculateWaveRadius,
  calculateEpicenterDistance,
  calculateIntensity,
  calculateLocalExpectedWaveTime,
  calculateExpectedIntensity,
  roundIntensity,
} from "./scripts/helper/utils";
import {
  EewSource,
  EewStatus,
  ExpTechApi,
  WebSocketEvent,
} from "./scripts/class/api";
import { AudioType } from "./types";
import { Config } from "./scripts/class/config";
import { getAudio } from "./scripts/helper/audio";
import DefaultConfig from "./assets/json/default_config.json";
import code from "./assets/json/code.json";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

const webviewWindow = getCurrent();

const args = await getMatches();

const config = new Config<DefaultConfigSchema>(DefaultConfig as DefaultConfigSchema);

if (!args.args["quiet"].value) {
  webviewWindow.show();
}

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, int: [], time: Date.now() }),
  currentEewIndex: ref<string>(),
  eew: reactive<Record<string, EewEvent>>({}),
};

const timer: Record<string, number> = {};
const eewTimer: Record<string, number> = {};

const api = new ExpTechApi(config.cache.api.key);
const ntp = { remote: Date.now(), server: Date.now(), client: Date.now() };

const app = createApp(App, props);

app.provide("api", api);
app.provide("config", config);

const instance = app.mount("#app") as InstanceType<typeof App>;

await webviewWindow.setAlwaysOnTop(config.cache.behavior.alwaysOnTop);

if (config.cache.system.startWithSystem) {
  await enableAutoStart();
} else if (await isAutoStartEnabled()) {
  await disableAutoStart();
}

const updateResources = async () => {
  const ids = props.reports.map((r) => r.id);
  const reports = (await api.getReports()).filter((r) => !ids.includes(r.id));

  props.reports.push(...reports);
  props.reports.sort((a, b) => b.time - a.time);

  props.stations.value = await api.getStations();
};

updateResources();
timer.reportFetchTimer = window.setInterval(updateResources, 60_000);

let replayMode: boolean = false;

const setEewIndex = () => {
  const keys = Object.keys(props.eew);
  if (keys.length) {
    if (props.currentEewIndex.value) {
      const index = keys.indexOf(props.currentEewIndex.value);

      if (index + 1 < keys.length) {
        if (keys.at(index + 1) != props.currentEewIndex.value) {
          props.currentEewIndex.value = keys.at(index + 1);
        }
        return;
      }
    }

    if (keys[0] != props.currentEewIndex.value) {
      props.currentEewIndex.value = keys[0];
    }
  }
};

const resetEew = () => {
  console.log("[EEW] Cleaning eew states...");

  props.currentEewIndex.value = undefined;
  window.clearInterval(timer.eewRadiusTimer);
  window.clearInterval(timer.eewIndexTimer);
  delete timer.eewRadiusTimer;
  delete timer.eewIndexTimer;

  for (const id in props.eew) {
    delete eewTimer[id];
    delete props.eew[id];
  }

  if (!config.cache.behavior.alwaysOnTop) {
    webviewWindow.setAlwaysOnTop(false);
  }

  webviewWindow.requestUserAttention(null);
};

api.on(WebSocketEvent.Rts, (rts) => {
  if (replayMode && !rts.replay) {
    return;
  }

  rts.int ??= [];

  for (const i of rts.int) {
    const location = code[i.code];
    i.area = location.city;
    i.station = location.town;
  }

  props.rts.value = rts;
});

api.on(WebSocketEvent.Eew, (eew) => {
  if (replayMode && !eew.replay) {
    return;
  }
  if ((props.eew[eew.id]?.serial ?? 0) >= eew.serial) {
    return;
  }

  console.debug(eew);
  const time = getAccurateTime();
  const waveRadius = calculateWaveRadius(time, eew.eq.depth, eew.eq.time);

  const { intensity } = calculateExpectedIntensity(
    { lat: eew.eq.lat, lng: eew.eq.lon },
    eew.eq.mag,
    eew.eq.depth
  );

  const data: EewEvent = {
    r: waveRadius,
    lng: eew.eq.lon,
    lat: eew.eq.lat,
    location: eew.eq.loc,
    magnitude: eew.eq.mag,
    depth: eew.eq.depth,
    serial: eew.serial,
    source: eew.author,
    detail: eew.author == EewSource.Trem ? eew.detail : 1,
    status: eew.status,
    int: intensity,
    max: eew.eq.max,
    final: !!eew.final,
    cancel: props.eew[eew.id]?.cancel || eew.status == EewStatus.Cancel,
    time: eew.eq.time,
    raw: eew,
  };

  if (config.cache.location.area) {
    const area = code[config.cache.location.area];
    const { surfaceDistance, distance } = calculateEpicenterDistance({
      lat: eew.eq.lat,
      lng: eew.eq.lon,
    })({ lng: area.lng, lat: area.lat })(eew.eq.depth);
    const localExpectedIntensity = calculateIntensity(
      surfaceDistance,
      distance,
      eew.eq.mag,
      eew.eq.depth
    );

    data.surface = surfaceDistance;
    data.distance = distance;
    data.i = roundIntensity(localExpectedIntensity);

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
        for (const id in props.eew) {
          const e = props.eew[id];
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
    Object.keys(props.eew).length == 0 &&
    eew.serial == 1 &&
    config.cache.behavior.focusWindowWhenEew
  ) {
    instance.changeView("home");
    webviewWindow.setFocus();
  }

  if (
    !config.cache.behavior.alwaysOnTop &&
    config.cache.behavior.alwaysOnTopWhenEew
  ) {
    webviewWindow.setAlwaysOnTop(true);
  }

  if (props.eew[eew.id]) {
    if (eew.serial > props.eew[eew.id].serial) {
      webviewWindow.requestUserAttention(UserAttentionType.Informational);

      if (config.cache.audio.enabled) {
        getAudio(config.cache.audio.theme, AudioType.Update).play();
      }
    }
  } else {
    webviewWindow.requestUserAttention(UserAttentionType.Critical);

    if (!eewTimer[eew.id]) {
      eewTimer[eew.id] = window.setTimeout(() => {
        delete props.eew[eew.id];
        delete eewTimer[eew.id];

        if (
          props.currentEewIndex.value == eew.id &&
          Object.keys(props.eew).length
        ) {
          setEewIndex();
        }
      }, 240_000);
    }

    if (eew.author == EewSource.Cwa) {
      if (config.cache.audio.enabled) {
        getAudio(config.cache.audio.theme, AudioType.CwaEew).play();
      }
    } else {
      if (config.cache.audio.enabled) {
        getAudio(config.cache.audio.theme, AudioType.Eew).play();
      }
    }
  }

  props.eew[eew.id] = data;

  if (!props.currentEewIndex.value) {
    props.currentEewIndex.value = `${eew.id}`;
  }

  if (!timer.eewRadiusTimer) {
    timer.eewRadiusTimer = window.setInterval(() => {
      if (!Object.keys(props.eew).length) {
        resetEew();
      }

      for (const id in props.eew) {
        const e = props.eew[id];

        props.eew[id].r = calculateWaveRadius(
          getAccurateTime(),
          e.depth,
          e.time
        );
      }
    }, 100);
  }

  if (!timer.eewIndexTimer) {
    timer.eewIndexTimer = window.setInterval(setEewIndex, 2_000);
  }
});

api.on(WebSocketEvent.Ntp, ({ time }) => {
  if (!replayMode) {
    ntp.server = time;
    ntp.client = Date.now();
  }

  ntp.remote = time;
});

api.on(WebSocketEvent.Close, console.debug);

const getAccurateTime = () => {
  return ntp.server + (Date.now() - ntp.client);
};

const unlisten = await webviewWindow.listen<{ paths: string[]; }>("tauri://file-drop", async (e) => {
  if (replayMode) {
    return;
  }

  if (!e.payload.paths[0].endsWith(".trply")) {
    return;
  }

  replayMode = true;

  try {
    console.log(
      `[Replay] Loading replay ${e.payload.paths[0].split(/(\\|\/)/g).pop()}`
    );

    const replayData: { rts: Rts; eew: Eew[]; time: number; }[] = [];
    const binary = await readFile(e.payload.paths[0]);
    const zip = await JSZip.loadAsync(binary);

    for (let i = 0, k = Object.keys(zip.files), n = k.length; i < n; i++) {
      const filename = k[i];
      const content = await zip.files[filename].async("string");
      const data: { rts: Rts; eew: Eew[]; time: number; } = JSON.parse(content);
      data.rts.replay = true;
      data.eew.forEach((e) => (e.replay = true));
      data.time = +filename;
      replayData.push(data);
    }

    const replayLength = replayData.length;
    let replayPercentage = 0;
    console.log(`[Replay] Loaded ${replayLength} frames.`);

    const emitEvents = () => {
      const current = replayData.shift();

      if (!current) {
        resetEew();
        replayMode = false;
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
        console.log(
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
  } catch (error) {
    console.error("[Replay] Exception thrown while loading replay.", error);
    replayMode = false;
  }
});
unlisten();

webviewWindow.onCloseRequested((event) => {
  if (config.cache.system.closeToTray) {
    event.preventDefault();
    webviewWindow.hide();
  }
});

document.addEventListener("keydown", (ev) => {
  // Disabling keyboard shortcuts
  //ev.preventDefault();

  if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
    switch (ev.code) {
      case "Digit1":
        instance.changeView("home");
        break;

      case "Digit2":
        instance.changeView("report-list");
        break;

      case "Digit3":
      case "KeyO":
        instance.changeView("setting");
        break;

      case "KeyR":
        location.reload();
        break;

      default:
        break;
    }
  }
});