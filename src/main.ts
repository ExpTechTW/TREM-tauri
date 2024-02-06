import App from "./App.vue";

import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import { fs, window } from "@tauri-apps/api";

import {
  EewSource,
  EewStatus,
  ExpTechApi,
  WebSocketEvent,
} from "./scripts/class/api";
import type { Station, PartialReport, Rts, Eew } from "./scripts/class/api";
import {
  calculateWaveRadius,
  calculateEpicenterDistance,
  calculateIntensity,
  calculateLocalExpectedWaveTime,
  calculateExpectedIntensity,
} from "./scripts/helper/utils";
import { AudioType, type DefaultSettingSchema, type EewEvent } from "./types";
import { getAudio } from "./scripts/helper/audio";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";
import { UserAttentionType } from "@tauri-apps/api/window";
import JSZip from "jszip";

const browserWindow = window.getCurrent();

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, time: Date.now() }),
  currentEewIndex: ref<string>(),
  eew: reactive<Record<string, EewEvent>>({}),
};

const settingRepository = new SettingsManager<DefaultSettingSchema>({
  api: { key: "" },
  behavior: { showWindowWhenEew: true, openExternal: false },
  location: { lat: 0, lng: 0 },
  audio: { enabled: true, theme: "trem_default" },
});

const api = new ExpTechApi();
const ntp = { remote: Date.now(), server: Date.now(), client: Date.now() };

const app = createApp(App, props);

app.provide("settings", settingRepository);
app.provide("api", api);

const instance = app.mount("#app") as InstanceType<typeof App>;

(async () => {
  await settingRepository.initialize();
  await settingRepository.syncCache();

  api.setApiKey(await settingRepository.get("api.key"));

  props.reports.push(...(await api.getReports(20)));
  props.stations.value = await api.getStations();
})();

let eewRadiusTimer: NodeJS.Timeout;
let eewReplay: boolean = false;

api.on(WebSocketEvent.Rts, (rts) => {
  if (eewReplay && !rts.replay) return;
  props.rts.value = rts;
});

api.on(WebSocketEvent.Eew, (eew) => {
  if (eewReplay && !eew.replay) return;
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

  if (
    settingRepository.settings.location.lat &&
    settingRepository.settings.location.lng
  ) {
    const { surfaceDistance, distance } = calculateEpicenterDistance({
      lat: eew.eq.lat,
      lng: eew.eq.lon,
    })(settingRepository.settings.location)(eew.eq.depth);
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
    settingRepository.settings.behavior.showWindowWhenEew
  )
    browserWindow.setFocus();

  browserWindow.requestUserAttention(UserAttentionType.Critical);

  if (settingRepository.settings.audio.enabled)
    if (props.eew[eew.id]) {
      if (eew.serial > props.eew[eew.id].serial) {
        getAudio(
          settingRepository.settings.audio.theme,
          AudioType.Update
        ).play();
      }
    } else {
      if (eew.author == EewSource.Cwa) {
        getAudio(
          settingRepository.settings.audio.theme,
          AudioType.CwaEew
        ).play();
      } else {
        getAudio(settingRepository.settings.audio.theme, AudioType.Eew).play();
      }
    }

  props.eew[eew.id] = data;
  props.currentEewIndex.value = `${eew.id}`;

  if (!eewRadiusTimer)
    eewRadiusTimer = setInterval(() => {
      if (!Object.keys(props.eew).length) {
        clearInterval(eewRadiusTimer);
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
});

api.on(WebSocketEvent.Ntp, ({ time }) => {
  if (!eewReplay) {
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
  if (eewReplay) return;
  if (e.payload.type != "drop") return;
  if (!e.payload.paths[0].endsWith(".trply")) return;

  eewReplay = true;

  try {
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

    const emitEvents = () => {
      const current = replayData.shift();
      if (!current) {
        eewReplay = false;
        ntp.server = ntp.remote;
        ntp.client = Date.now();
        return;
      }

      ntp.server = current.time;
      ntp.client = Date.now();

      api.emit(WebSocketEvent.Rts, current.rts);
      current.eew.forEach((e) => api.emit(WebSocketEvent.Eew, e));

      setTimeout(emitEvents, replayData[0].time - current.time);
    };

    emitEvents();
  } catch (error) {
    console.error(error);
    eewReplay = false;
  }
});
