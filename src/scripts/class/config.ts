import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { error, info } from "@tauri-apps/plugin-log";

const dir = await appConfigDir();
const path = await join(dir, "config.json");

if (!(await exists(path))) {
  info("[Config] Creating configuration file...");
  await mkdir(dir, { recursive: true }).catch(error);
  await writeTextFile(path, JSON.stringify({}, null, 2)).catch(error);
}

info("[Config] Loading user configuration...");
const data = JSON.parse(await readTextFile(path));
info("[Config] Configuration loaded.");

export class Config<T> {
  dir: string;
  path: string;
  defaultValue: T;
  cache: T;

  constructor(defaultValue: T) {
    this.dir = dir;
    this.path = path;
    this.defaultValue = defaultValue;
    this.cache = { ...defaultValue, ...data };
    this.save();
  }

  async load() {
    info("[Config] Loading user configuration...");
    const data = JSON.parse(await readTextFile(path));
    this.cache = { ...this.defaultValue, ...data };
    info("[Config] Configuration loaded.");
  }

  async save() {
    info("[Config] Saving user configuration...");
    await writeTextFile(path, JSON.stringify(this.cache, null, 2));
    info("[Config] Configuration saved");
  }
}
