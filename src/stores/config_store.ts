import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { defineStore } from "pinia";

const DefaultConfig = {
  earthquake: {
    display: 0
  }
};

let config: typeof DefaultConfig;

if (!await exists("", { baseDir: BaseDirectory.AppConfig })) {
  await mkdir("", { baseDir: BaseDirectory.AppConfig });
}

if (await exists("config.json", { baseDir: BaseDirectory.AppConfig })) {
  try {
    config = JSON.parse(await readTextFile("config.json", { baseDir: BaseDirectory.AppConfig }));
  } catch (error) {
    console.log(error);
    config = DefaultConfig;
  }
} else {
  config = DefaultConfig;
  await writeTextFile(
    "config.json",
    JSON.stringify(config, null, 2), {
    baseDir: BaseDirectory.AppConfig,
  }).catch(console.error);
}

export const useConfigStore = defineStore("config", {
  state: () => config,
  actions: {
    async save() {
      await writeTextFile(
        "config.json",
        JSON.stringify(this.$state, null, 2), {
        baseDir: BaseDirectory.AppConfig,
      });
    }
  }
});