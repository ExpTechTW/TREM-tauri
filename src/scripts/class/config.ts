import { appConfigDir, join } from "@tauri-apps/api/path";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const dir = await appConfigDir();
const path = await join(dir, "config.json");

if (!await exists(path)) {
  await writeTextFile(path, JSON.stringify({}, null, 2)).catch(console.error);
};

const data = JSON.parse(await readTextFile(path));

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
    await readTextFile(path);
  }

  async save() {
    await writeTextFile(path, JSON.stringify(this.cache, null, 2));
  }
}