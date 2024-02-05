import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import App from "./App.vue";

import {
  EewSource,
  EewStatus,
  ExpTechApi,
  WebSocketEvent,
} from "./scripts/class/api";
import type { Station, PartialReport, Rts } from "./scripts/class/api";

import { AudioType, type DefaultSettingSchema, type EewEvent } from "./types";
import {
  calculateWaveRadius,
  calculateEpicenterDistance,
  calculateIntensity,
  calculateLocalExpectedWaveTime,
  calculateExpectedIntensity,
} from "./scripts/helper/utils";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";
import { getAudio } from "./scripts/helper/audio";

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, time: Date.now() }),
  currentEewIndex: ref<string>(),
  eew: reactive<Record<string, EewEvent>>({}),
};

const settingRepository = new SettingsManager<DefaultSettingSchema>({
  api: { key: "" },
  behavior: { openExternal: false },
  location: { lat: 0, lng: 0 },
  audio: { theme: "trem_default" },
});

const api = new ExpTechApi();
const ntp = ref({ server: Date.now(), client: Date.now() });

const app = createApp(App, props);

app.provide("settings", settingRepository);
app.provide("api", api);
app.provide("ntp", ntp);

app.mount("#app");

(async () => {
  await settingRepository.initialize();
  await settingRepository.syncCache();

  api.setApiKey(await settingRepository.get("api.key"));

  props.reports.push(...(await api.getReports(20)));
  props.stations.value = await api.getStations();
})();

let eewRadiusTimer: NodeJS.Timeout;

api.on(WebSocketEvent.Rts, (raw) => {
  props.rts.value = raw;
});

api.on(WebSocketEvent.Eew, (eew) => {
  console.debug(eew);

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

  console.log(intensity);


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

  if (props.eew[eew.id]) {
    if (eew.serial > props.eew[eew.id].serial) {
      getAudio(settingRepository.settings.audio.theme, AudioType.Update).play();
    }
  } else {
    if (eew.author == EewSource.Cwa) {
      getAudio(settingRepository.settings.audio.theme, AudioType.CwaEew).play();
    } else {
      getAudio(settingRepository.settings.audio.theme, AudioType.Eew).play();
    }
  }

  console.log(data);

  props.eew[eew.id] = data;
  props.currentEewIndex.value = eew.id;

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
  ntp.value = { server: time, client: Date.now() };
});

api.on(WebSocketEvent.Close, console.debug);

const getAccurateTime = () => {
  return ntp.value.server + (Date.now() - ntp.value.client);
};

setTimeout(() => {
  const eew = {
    type: "eew",
    author: EewSource.Cwa,
    id: "113044201",
    serial: 1,
    status: 0,
    final: 0,
    eq: {
      time: Date.now() - 15000,
      lon: 120.27,
      lat: 23.46,
      depth: 10,
      mag: 4.7,
      loc: "嘉義縣 太保市",
      max: 4,
    },
    timestamp: Date.now() - 15000,
    data_unit: "websocket",
    delay: 3349,
  };

  api.emit(WebSocketEvent.Eew, eew);
}, 10000);
