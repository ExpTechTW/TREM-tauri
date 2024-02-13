interface RouteOptions {
  version?: 1 | 2;
  key?: string;
}

export default class Route {
  version: number;
  key: string;

  constructor(options: RouteOptions = {}) {
    this.version = options.version ?? 2;
    this.key = options.key ?? "";
  }

  randomHostUrl() {
    return `https://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw` as const;
  }

  randomBaseUrl(version: number = this.version) {
    return `${this.randomHostUrl()}/api/v${version}` as const;
  }

  websocket() {
    return `wss://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw/websocket` as const;
  }

  earthquakeReportList(limit: number = 50) {
    return `${this.randomBaseUrl()}/eq/report?limit=${limit}&key=${this.key}` as const;
  }

  earthquakeReport(id: string) {
    return `${this.randomBaseUrl()}/eq/report/${id}` as const;
  }

  rts(version: number,timestamp: string) {
    return `${this.randomBaseUrl(version)}/trem/rts?time=${timestamp}` as const;
  }

  station() {
    return `${this.randomHostUrl()}/file/resource/station.json` as const;
  }
}
