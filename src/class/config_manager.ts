interface ConfigScheme {
  [key: string]: any;
}

class ConfigManager {
  cache: ConfigScheme;

  constructor() {
    this.cache = {};
  }
}