import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import App from "./App.vue";

import { EewOrigin, ExpTechApi, WebSocketEvent } from "./scripts/class/api";
import type { Station, PartialReport, Rts, Eew } from "./scripts/class/api";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";
import type { DefaultSettingSchema } from "./types";

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, time: Date.now() }),
  // temporary test data
  eew: ref<Record<string, Eew>>({
    "113044201": {
      type: "eew",
      author: EewOrigin.Cwa,
      id: "113044201",
      serial: 1,
      status: 0,
      final: 0,
      eq: {
        time: Date.now(),
        lon: 120.27,
        lat: 23.46,
        depth: 10,
        mag: 4.7,
        loc: "",
        max: 0,
      },
      timestamp: Date.now(),
      data_unit: "websocket",
      delay: 3349,
    },
  }),
};

const settings = new SettingsManager<DefaultSettingSchema>({
  api: { key: "" },
  behavior: { openExternal: false },
});

const api = new ExpTechApi();
const ntp = ref({ server: Date.now(), client: Date.now() });

const app = createApp(App, props);

app.provide("settings", settings);
app.provide("api", api);
app.provide("ntp", ntp);

app.mount("#app");

(async () => {
  await settings.initialize();
  await settings.syncCache();

  api.setApiKey(await settings.get("api.key"));

  api.on(WebSocketEvent.Rts, (raw) => {
    props.rts.value = raw;
  });

  api.on(WebSocketEvent.Eew, (eew) => {
    props.eew.value[eew.id] = eew;
  });

  api.on(WebSocketEvent.Ntp, ({ time }) => {
    ntp.value = { server: time, client: Date.now() };
    console.log("ntp");
  });

  api.on(WebSocketEvent.Close, console.debug);

  props.reports.push(...(await api.getReports(20)));
  props.stations.value = await api.getStations();
})();
