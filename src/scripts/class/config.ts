import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { debug, error, info } from "@tauri-apps/plugin-log";
import { appConfigDir, join } from "@tauri-apps/api/path";

import type { DefaultConfigSchema } from "../../types";

import DefaultConfig from "../../assets/json/default_config.json";

const dir = await appConfigDir();
const path = await join(dir, "config.json");

if (!(await exists(path))) {
  info("[Config] Configuration file does not exist, creating...");
  await mkdir(dir, { recursive: true }).catch(error);
  await writeTextFile(path, JSON.stringify(DefaultConfig, null, 2)).catch(
    error
  );
  info("[Config] Created configuration file with default values.");
}

info("[Config] Loading user configuration...");
const data = JSON.parse(await readTextFile(path));
info("[Config] Configuration loaded.");

export class Config {
  dir: string;
  path: string;
  cache: DefaultConfigSchema;

  constructor() {
    this.dir = dir;
    this.path = path;
    this.cache = { ...DefaultConfig, ...data };
    debug("[Config] Config is ready.");
  }

  async load() {
    try {
      info("[Config] Loading user configuration...");
      const data = JSON.parse(await readTextFile(path));
      this.cache = { ...DefaultConfig, ...data };
      info("[Config] Configuration loaded.");
    } catch (err) {
      if (err instanceof Error) {
        error(
          `[Config] Error while reading configuration file: ${err.message}`
        );
        if (err.stack) {
          error(err.stack);
        }
      }
    }
  }

  async save() {
    try {
      info("[Config] Saving user configuration...");
      await writeTextFile(path, JSON.stringify(this.cache, null, 2));
      info("[Config] Configuration saved");
    } catch (err) {
      if (err instanceof Error) {
        error(`[Config] Error while saving configuration file: ${err.message}`);
        if (err.stack) {
          error(err.stack);
        }
      }
    }
  }
}
