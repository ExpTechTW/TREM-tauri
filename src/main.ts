import App from "./App.vue";

import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import { fs, window as win } from "@tauri-apps/api";
import { UserAttentionType } from "@tauri-apps/api/window";
import JSZip from "jszip";

import type { Station, PartialReport, Rts, Eew } from "./scripts/class/api";
import type { DefaultSettingSchema, EewEvent, RtsIntensity } from "./types";
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
import { getAudio } from "./scripts/helper/audio";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

const browserWindow = win.getCurrent();

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, time: Date.now() }),
  rtsInt: ref<RtsIntensity[]>([]),
  currentEewIndex: ref<string>(),
  eew: reactive<Record<string, EewEvent>>({}),
};

const timer: Record<string, number> = {};

const setting = new SettingsManager<DefaultSettingSchema>({
  api: { key: "" },
  behavior: { showWindowWhenEew: true, openExternal: false },
  location: { lat: 0, lng: 0 },
  audio: { enabled: true, theme: "trem_default" },
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

  props.reports.push(...(await api.getReports(20)));
  props.stations.value = await api.getStations();

  /* 
    const dummy = { "rts": { replay: true, "station": { "1448736": { "pga": 0.54, "pgv": 1.59, "i": -3, "I": -2.4 }, "1480496": { "pga": 0.04, "pgv": 0, "i": -2.1, "I": -1.1 }, "2012144": { "pga": 1.98, "pgv": 1.5, "i": -2.7, "I": -2.3 }, "4812424": { "pga": 0.06, "pgv": 0, "i": -1.7, "I": -1.4 }, "4832348": { "pga": 1.6, "pgv": 3.07, "i": -2.9, "I": -0.8, "alert": 1 }, "4834840": { "pga": 0.47, "pgv": 1.67, "i": -3, "I": -1.3 }, "5570908": { "pga": 1.32, "pgv": 2.7, "i": -3, "I": -2.3, "alert": 1 }, "5963580": { "pga": 1.39, "pgv": 3.47, "i": -3, "I": -2.3 }, "5982528": { "pga": 1.37, "pgv": 2.26, "i": -3, "I": -2.5 }, "5995220": { "pga": 0.87, "pgv": 3.41, "i": -3, "I": 0.9 }, "6001632": { "pga": 0.99, "pgv": 2.69, "i": -3, "I": -0.4, "alert": 1 }, "6024300": { "pga": 1.9, "pgv": 0.97, "i": -2.7, "I": 0, "alert": 1 }, "6024428": { "pga": 1.26, "pgv": 3.52, "i": -3, "I": -2.3, "alert": 1 }, "6079596": { "pga": 1.79, "pgv": 1.71, "i": -2.8, "I": -2.3 }, "6101688": { "pga": 1.56, "pgv": 1.95, "i": -2.9, "I": 0.8, "alert": 1 }, "6110036": { "pga": 0.68, "pgv": 2.53, "i": -3, "I": -1.9 }, "6125804": { "pga": 0.06, "pgv": 0, "i": -1.7, "I": -0.6, "alert": 1 }, "6345688": { "pga": 1.5, "pgv": 2.7, "i": -2.9, "I": -2.3 }, "6392144": { "pga": 0.91, "pgv": 4.72, "i": -3, "I": -2.2 }, "6654540": { "pga": 0.61, "pgv": 2.61, "i": -3, "I": -2.3 }, "6662308": { "pga": 1.38, "pgv": 0.58, "i": -3, "I": -2.2 }, "6732340": { "pga": 1.62, "pgv": 3.73, "i": -2.9, "I": -2.3 }, "6759352": { "pga": 1.21, "pgv": 3.25, "i": -3, "I": -2.4 }, "7693052": { "pga": 1.62, "pgv": 3.01, "i": -2.9, "I": 0.3, "alert": 1 }, "7713276": { "pga": 2.26, "pgv": 1.6, "i": -2.6, "I": 1.3, "alert": 1 }, "7713348": { "pga": 1.74, "pgv": 2.99, "i": -2.8, "I": -2.3 }, "7713716": { "pga": 1.59, "pgv": 1.92, "i": -2.9, "I": 0, "alert": 1 }, "7714012": { "pga": 0.59, "pgv": 4.3, "i": -3, "I": -2.1 }, "7715856": { "pga": 0.86, "pgv": 2.64, "i": -3, "I": -2.5 }, "7716472": { "pga": 1.24, "pgv": 3.11, "i": -3, "I": -2.4 }, "7725352": { "pga": 2.23, "pgv": 2.7, "i": -2.6, "I": -2.3 }, "7725532": { "pga": 1.36, "pgv": 0.97, "i": -3, "I": -2.2 }, "7735548": { "pga": 0.66, "pgv": 4.67, "i": -3, "I": -1.4 }, "11334552": { "pga": 0.49, "pgv": 0.94, "i": -3, "I": -2.3 }, "11334672": { "pga": 0.27, "pgv": 1.67, "i": -3, "I": -0.8 }, "11334772": { "pga": 1.06, "pgv": 1.88, "i": -3, "I": 0.9, "alert": 1 }, "11334780": { "pga": 1.94, "pgv": 2.65, "i": -2.7, "I": -0.2 }, "11334880": { "pga": 0.06, "pgv": 0, "i": -1.8, "I": -0.6, "alert": 1 }, "11335736": { "pga": 0.84, "pgv": 0.89, "i": -3, "I": -2.2 }, "11336648": { "pga": 1.32, "pgv": 2.52, "i": -3, "I": -2.4 }, "11336816": { "pga": 1.17, "pgv": 1.62, "i": -3, "I": -2.2 }, "11336952": { "pga": 0.09, "pgv": 0.01, "i": -1.4, "I": -0.4, "alert": 1 }, "11337052": { "pga": 1.08, "pgv": 0.35, "i": -3, "I": -2.4 }, "11339360": { "pga": 2.19, "pgv": 1.59, "i": -2.6, "I": -2.2 }, "11339620": { "pga": 0.03, "pgv": 0, "i": -2.4, "I": -1.2 }, "11340836": { "pga": 0.98, "pgv": 3.13, "i": -3, "I": -2.3 }, "11341244": { "pga": 0.3, "pgv": 1.69, "i": -3, "I": -2.4 }, "11342416": { "pga": 2.02, "pgv": 1.16, "i": -2.7, "I": -2.1 }, "11342740": { "pga": 0.96, "pgv": 2.03, "i": -3, "I": -2.3 }, "11343452": { "pga": 2.16, "pgv": 1.55, "i": -2.6, "I": -1.9 }, "11343556": { "pga": 1.51, "pgv": 1.83, "i": -2.9, "I": 0.4 }, "11354012": { "pga": 1.46, "pgv": 2.86, "i": -3, "I": -2.1 }, "11355624": { "pga": 0.9, "pgv": 4, "i": -3, "I": -2.4 }, "11358232": { "pga": 0.75, "pgv": 3.49, "i": -3, "I": -2.3 }, "11361000": { "pga": 1.79, "pgv": 2.53, "i": -2.8, "I": -2.1 }, "11362396": { "pga": 1.64, "pgv": 0.83, "i": -2.9, "I": -1.6 }, "11363084": { "pga": 2.37, "pgv": 2.31, "i": -2.6, "I": 0.5, "alert": 1 }, "11364524": { "pga": 1.49, "pgv": 1.35, "i": -3, "I": 0.9, "alert": 1 }, "11366796": { "pga": 1.8, "pgv": 1.53, "i": -2.8, "I": -2.4 }, "11366940": { "pga": 1.12, "pgv": 2.9, "i": -3, "I": 0.7, "alert": 1 }, "11367144": { "pga": 0.6, "pgv": 0.48, "i": -3, "I": -2.4 }, "11368592": { "pga": 0.73, "pgv": 6.33, "i": -3, "I": 0.3, "alert": 1 }, "11370676": { "pga": 0.2, "pgv": 0.01, "i": -0.7, "I": 0.4, "alert": 1 }, "11372592": { "pga": 1.1, "pgv": 2.19, "i": -3, "I": -2.3 }, "11373176": { "pga": 1.12, "pgv": 2.16, "i": -3, "I": -2.2 }, "11376580": { "pga": 0.82, "pgv": 1.7, "i": -3, "I": 1.1, "alert": 1 }, "11420168": { "pga": 1.94, "pgv": 2.01, "i": -2.7, "I": -0.9 }, "11423064": { "pga": 3.26, "pgv": 0.52, "i": -2.3, "I": -0.5 }, "13898616": { "pga": 1.59, "pgv": 2.62, "i": -2.9, "I": -2.1, "alert": 1 }, "13901208": { "pga": 2.67, "pgv": 3.93, "i": -2.4, "I": 0.5 }, "14219088": { "pga": 0.87, "pgv": 1.86, "i": -3, "I": -1 }, "14220884": { "pga": 1.66, "pgv": 2.36, "i": -2.9, "I": -2.2 }, "14226992": { "pga": 1.67, "pgv": 2.27, "i": -2.9, "I": -2.3 }, "14252376": { "pga": 0.37, "pgv": 1.31, "i": -3, "I": -2.5 }, "14287896": { "pga": 1.01, "pgv": 4.95, "i": -3, "I": -2.3 }, "14312724": { "pga": 0.76, "pgv": 0.69, "i": -3, "I": -2.2 }, "14628520": { "pga": 0.97, "pgv": 2.23, "i": -3, "I": -2.3 }, "14629688": { "pga": 1.1, "pgv": 2.81, "i": -3, "I": 0.7 }, "14638108": { "pga": 1.5, "pgv": 2.55, "i": -2.9, "I": -2.4 }, "14771008": { "pga": 0.82, "pgv": 1.72, "i": -3, "I": -1.6 }, "14771688": { "pga": 2.45, "pgv": 1.17, "i": -2.5, "I": -1, "alert": 1 }, "14807572": { "pga": 0.58, "pgv": 1.73, "i": -3, "I": 0.2 }, "14814004": { "pga": 0.83, "pgv": 1.74, "i": -3, "I": 0.1, "alert": 1 }, "14815076": { "pga": 1.33, "pgv": 2.39, "i": -3, "I": -2.3 }, "15081076": { "pga": 2.24, "pgv": 1.54, "i": -2.6, "I": -2.3 } }, "box": { "11": 1, "16": 0, "21": 0, "22": 1, "23": 0, "27": 0 }, "time": 1706868664000 }, "eew": [{ replay: true, "type": "eew", "author": "trem", "id": 1706868633000, "serial": 19, "status": 0, "level": 1, "detail": 1, "final": 0, "reason": 0, "trigger": 22, "eq": { "time": Date.now() - 5000, "lon": 120.3, "lat": 23.45, "depth": 12, "mag": 4.7, "loc": "", "max": 4, "area": { "2": ["401", "406", "411", "420", "423", "427", "428", "429", "432", "500", "507", "508", "509"], "3": ["511", "520", "521", "522", "523", "524", "525", "530", "551", "556", "557", "558", "605", "607", "630", "632", "637", "640", "643", "646", "647", "648", "649", "715", "849"], "4": ["600", "603"] } } }] };
  
    eewReplay = true;
    api.emit(WebSocketEvent.Rts, dummy.rts);
    for (const e of dummy.eew) api.emit(WebSocketEvent.Eew, e);
   */
})();

let replayMode: boolean = false;
let rtsRecords: Record<string, Record<string, number>> = {};

const setEewIndex = () => {
  const keys = Object.keys(props.eew);
  if (keys.length) {
    if (props.currentEewIndex.value) {
      const index = keys.indexOf(props.currentEewIndex.value);

      if (index + 1 < keys.length) {
        if (keys.at(index + 1) != props.currentEewIndex.value)
          props.currentEewIndex.value = keys.at(index + 1);
        return;
      }
    }

    if (keys[0] != props.currentEewIndex.value) {
      props.currentEewIndex.value = keys[0];
    }
  }
};

const resetEew = () => {
  props.currentEewIndex.value = undefined;
  props.eew = reactive({});
  window.clearInterval(timer.eewRadiusTimer);
  window.clearInterval(timer.eewIndexTimer);
};

api.on(WebSocketEvent.Rts, (rts) => {
  if (replayMode && !rts.replay) return;
  props.rts.value = rts;

  if (Object.keys(props.eew).length) {
    for (const id in rts.station) {
      const data = rts.station[id];

      if (!data.alert || data.i <= 0) continue;

      const station = props.stations.value[id];
      const recordedInt = rtsRecords[station.city]?.[station.town] ?? 0;
      const currentInt = data.i;

      if (recordedInt < currentInt) {
        rtsRecords[station.city] ??= {};
        rtsRecords[station.city][station.town] = currentInt;
      }
    }

    props.rtsInt.value = Object.keys(rtsRecords)
      .flatMap((area) =>
        Object.keys(rtsRecords[area]).map((station) => ({
          area,
          station,
          int: roundIntensity(rtsRecords[area][station]),
          raw: rtsRecords[area][station],
        }))
      )
      .sort((a, b) => b.raw - a.raw);
  } else {
    rtsRecords = {};
  }
});

api.on(WebSocketEvent.Eew, (eew) => {
  if (replayMode && !eew.replay) return;
  if ((props.eew[eew.id]?.serial ?? 0) >= eew.serial) return;

  const waveRadius = calculateWaveRadius(
    getAccurateTime(),
    eew.eq.depth,
    eew.eq.time
  );

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
    status: eew.status,
    int: intensity,
    max: eew.eq.max,
    final: !!eew.final,
    cancel: props.eew[eew.id]?.cancel || eew.status == EewStatus.Cancel,
    time: eew.eq.time,
    raw: eew,
  };

  if (setting.settings.location.lat && setting.settings.location.lng) {
    const { surfaceDistance, distance } = calculateEpicenterDistance({
      lat: eew.eq.lat,
      lng: eew.eq.lon,
    })(setting.settings.location)(eew.eq.depth);
    const localExpectedIntensity = calculateIntensity(
      surfaceDistance,
      distance,
      eew.eq.mag,
      eew.eq.depth
    );
    const localExpectedWaveTime = calculateLocalExpectedWaveTime(
      distance,
      eew.eq.depth,
      eew.eq.time
    );

    data.t = localExpectedWaveTime;
    data.i = localExpectedIntensity;
  }

  instance.changeView("home");

  if (
    Object.keys(props.eew).length == 0 &&
    eew.serial == 1 &&
    setting.settings.behavior.showWindowWhenEew
  )
    browserWindow.setFocus();

  browserWindow.requestUserAttention(UserAttentionType.Critical);

  if (props.eew[eew.id]) {
    if (eew.serial > props.eew[eew.id].serial) {
      if (setting.settings.audio.enabled) {
        getAudio(setting.settings.audio.theme, AudioType.Update).play();
      }
    }
  } else {
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
  }

  ntp.remote = time;
  ntp.server = time;
  ntp.client = Date.now();
});

api.on(WebSocketEvent.Close, console.debug);

const getAccurateTime = () => {
  return ntp.server + (Date.now() - ntp.client);
};

browserWindow.onFileDropEvent(async (e) => {
  if (replayMode) return;
  if (e.payload.type != "drop") return;
  if (!e.payload.paths[0].endsWith(".trply")) return;

  replayMode = true;

  try {
    console.log(
      `[Replay] Loading replay ${e.payload.paths[0].split(/(\\|\/)/g).pop()}`
    );

    const replayData: { rts: Rts; eew: Eew[]; time: number }[] = [];
    const binary = await fs.readBinaryFile(e.payload.paths[0]);
    const zip = await JSZip.loadAsync(binary);

    for (let i = 0, k = Object.keys(zip.files), n = k.length; i < n; i++) {
      const filename = k[i];
      const content = await zip.files[filename].async("string");
      const data: { rts: Rts; eew: Eew[]; time: number } = JSON.parse(content);
      data.rts.replay = true;
      data.eew.forEach((e) => (e.replay = true));
      data.time = +filename;
      replayData.push(data);
    }

    console.log(`[Replay] Loaded ${replayData.length} frames.`);

    const emitEvents = () => {
      const current = replayData.shift();
      if (!current) {
        replayMode = false;
        ntp.server = ntp.remote;
        ntp.client = Date.now();
        return;
      }

      ntp.server = current.time;
      ntp.client = Date.now();

      api.emit(WebSocketEvent.Rts, current.rts);
      current.eew.forEach((e) => api.emit(WebSocketEvent.Eew, e));

      window.setTimeout(emitEvents, replayData[0].time - current.time);
    };

    emitEvents();
  } catch (error) {
    console.error("[Replay] Exception thrown while loading replay.", error);
    replayMode = false;
  }
});
