import { createApp, reactive } from "vue";
import { SettingsManager } from "tauri-settings";
import App from "./App.vue";

import { ExpTechApi, WebSocketEvent } from "./scripts/class/api";
import type { PartialReport } from "./scripts/class/api";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

const props = {
  reports: reactive<PartialReport[]>([]),
}

createApp(App, props).mount("#app");

const settings = new SettingsManager({
  apikey: ""
});

(async() => {
  await settings.initialize();
  await settings.syncCache();
  const api = new ExpTechApi(await settings.get("apikey"));

  api.on(WebSocketEvent.Rts, console.debug);
  api.on(WebSocketEvent.Close, console.debug);

  props.reports.push(...(await api.getReports(10)));
})();