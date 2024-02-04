import { createApp, reactive, ref } from "vue";
import { SettingsManager } from "tauri-settings";
import App from "./App.vue";

import { ExpTechApi, WebSocketEvent } from "./scripts/class/api";
import type { Station, PartialReport, Rts } from "./scripts/class/api";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";
import type { DefaultSettingSchema } from "./types";

const props = {
  stations: ref<Record<string, Station>>({}),
  reports: reactive<PartialReport[]>([]),
  rts: ref<Rts>({ station: {}, box: {}, time: Date.now() }),
};

const settings = new SettingsManager<DefaultSettingSchema>({
  api: { key: "" },
  behavior: { openExternal: false },
});
const api = new ExpTechApi();

const app = createApp(App, props);

app.provide("settings", settings);
app.provide("api", api);

app.mount("#app");

(async () => {
  await settings.initialize();
  await settings.syncCache();

  api.setApiKey(await settings.get("api.key"));

  api.on(WebSocketEvent.Rts, (raw) => {
    props.rts.value = raw;
    console.debug(raw);
  });

  api.on(WebSocketEvent.Close, console.debug);

  props.reports.push(...(await api.getReports(20)));
  props.stations.value = await api.getStations();
})();
