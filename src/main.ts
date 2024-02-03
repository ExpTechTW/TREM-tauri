import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import App from "./App.vue";

import { ExpTechApi, WebSocketEvent } from "./scripts/class/api";
import type { Station, PartialReport, Rts } from "./scripts/class/api";

import "maplibre-gl/dist/maplibre-gl.css";
import stationJsonData from "./assets/json/station.json";
import "./styles.css";

const props = {
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, time: Date.now() }),
};

const app = createApp(App, props);
const settings = new SettingsManager({ apikey: "" });
const api = new ExpTechApi();
const stations = ref<Record<string, Station>>(stationJsonData);

app.provide("settings", settings);
app.provide("api", api);
app.provide("stations", stations);

app.mount("#app");

(async () => {
  await settings.initialize();
  await settings.syncCache();

  api.setApiKey(await settings.get("apikey"));

  api.on(WebSocketEvent.Rts, (raw) => {
    props.rts.value = raw;
    console.debug(raw);
  });

  api.on(WebSocketEvent.Close, console.debug);

  props.reports.push(...(await api.getReports(20)));
  stations.value = await api.getStations();
})();