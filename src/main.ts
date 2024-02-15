import App from "./App.vue";

import {
  enable as enableAutoStart,
  disable as disableAutoStart,
  isEnabled as isAutoStartEnabled,
} from "@tauri-apps/plugin-autostart";
import { createApp } from "vue";
import { getCurrent } from "@tauri-apps/api/window";
import { getMatches } from "@tauri-apps/plugin-cli";

import type { DefaultConfigSchema } from "./types";
import { Config } from "./scripts/class/config";

import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

import DefaultConfig from "./assets/json/default_config.json";

const webviewWindow = getCurrent();

const args = await getMatches();

if (!args.args["quiet"].value) {
  webviewWindow.show();
}

const config = new Config<DefaultConfigSchema>(
  DefaultConfig as DefaultConfigSchema
);

const app = createApp(App);
app.provide("config", config);
app.mount("#app");

await webviewWindow.setAlwaysOnTop(config.cache.behavior.alwaysOnTop);

if (config.cache.system.startWithSystem) {
  await enableAutoStart();
} else if (await isAutoStartEnabled()) {
  await disableAutoStart();
}
