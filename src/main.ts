import App from "./App.vue";

import {
  enable as enableAutoStart,
  disable as disableAutoStart,
} from "tauri-plugin-autostart-api";
import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import { fs, window as win } from "@tauri-apps/api";
import { UserAttentionType } from "@tauri-apps/api/window";
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
import { RefreshableTimeout } from "./scripts/class/timeout";
import { getAudio } from "./scripts/helper/audio";
import DefaultConfig from "./assets/json/default_config.json";
import code from "./assets/json/code.json";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

const browserWindow = win.getCurrent();

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, int: [], time: Date.now() }),
  currentEewIndex: ref<string>(),
  eew: reactive<Record<string, EewEvent>>({}),
};

const timer: Record<string, number> = {};
const eewTimer: Record<string, RefreshableTimeout> = {};

const setting = new SettingsManager<DefaultConfigSchema>(
  DefaultConfig as DefaultConfigSchema, {
  prettify: true,
});

const api = new ExpTechApi();
const ntp = { remote: Date.now(), server: Date.now(), client: Date.now() };

const app = createApp(App, props);

app.provide("settings", setting);
app.provide("api", api);

const instance = app.mount("#app") as InstanceType<typeof App>;

(async () => {
  await setting.initialize();
  await setting.syncCache();

  api.setApiKey(await setting.get("api.key"));

  props.reports.push(...(await api.getReports(50)));
  props.stations.value = await api.getStations();

  await browserWindow.setAlwaysOnTop(setting.settings.behavior.alwaysOnTop);

  if (setting.settings.system.startWithSystem) {
    await enableAutoStart();
  } else {
    disableAutoStart();
  }
})();

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
    eewTimer[id].clear();
    delete props.eew[id];
  }

  if (!setting.settings.behavior.alwaysOnTop) {
    browserWindow.setAlwaysOnTop(false);
  }

  browserWindow.requestUserAttention(null);
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

  if (setting.settings.location.area) {
    const area = code[setting.settings.location.area];
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

  instance.changeView("home");

  if (
    Object.keys(props.eew).length == 0 &&
    eew.serial == 1 &&
    setting.settings.behavior.focusWindowWhenEew
  ) {
    browserWindow.setFocus();
  }

  if (
    !setting.settings.behavior.alwaysOnTop &&
    setting.settings.behavior.alwaysOnTopWhenEew
  ) {
    browserWindow.setAlwaysOnTop(true);
  }

  if (props.eew[eew.id]) {
    if (eew.serial > props.eew[eew.id].serial) {
      if (time - eew.eq.time > 120_000) {
        eewTimer[eew.id].refresh(30_000);
      } else {
        eewTimer[eew.id].refresh();
      }

      browserWindow.requestUserAttention(UserAttentionType.Informational);

      if (setting.settings.audio.enabled) {
        getAudio(setting.settings.audio.theme, AudioType.Update).play();
      }
    }
  } else {
    browserWindow.requestUserAttention(UserAttentionType.Critical);

    if (!eewTimer[eew.id]) {
      eewTimer[eew.id] = new RefreshableTimeout(() => {
        delete props.eew[eew.id];
        delete eewTimer[eew.id];

        if (
          props.currentEewIndex.value == eew.id &&
          Object.keys(props.eew).length
        ) {
          setEewIndex();
        }
      }, 120_000);
    }

    if (eew.author == EewSource.Cwa) {
      if (setting.settings.audio.enabled) {
        getAudio(setting.settings.audio.theme, AudioType.CwaEew).play();
      }
    } else {
      if (setting.settings.audio.enabled) {
        getAudio(setting.settings.audio.theme, AudioType.Eew).play();
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

browserWindow.onFileDropEvent(async (e) => {
  if (replayMode) {
    return;
  }
  if (e.payload.type != "drop") {
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
    const binary = await fs.readBinaryFile(e.payload.paths[0]);
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

browserWindow.onCloseRequested((event) => {
  if (setting.settings.system.closeToTray) {
    event.preventDefault();
    browserWindow.hide();
  }
});
