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

  randomBaseUrl() {
    return `${this.randomHostUrl()}/api/v${this.version}` as const;
  }

  websocket() {
    return `wss://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw/websocket` as const;
  }

  earthquakeReportList(limit?: number) {
    if (limit) {
      return `${this.randomBaseUrl()}/eq/report?limit=${limit}` as const;
    } else {
      return `${this.randomBaseUrl()}/eq/report?limit=50` as const;
    }
  }

  earthquakeReport(id: string) {
    return `${this.randomBaseUrl()}/eq/report/${id}` as const;
  }

  rts(timestamp?: string) {
    if (timestamp) {
      return `${this.randomBaseUrl()}/trem/rts/${timestamp}` as const;
    } else {
      return `${this.randomBaseUrl()}/trem/rts` as const;
    }
  }

  eew(timestamp?: string) {
    if (timestamp) {
      return `${this.randomBaseUrl()}/eq/eew/${timestamp}` as const;
    } else {
      return `${this.randomBaseUrl()}/eq/eew` as const;
    }
  }

  station() {
    return `${this.randomHostUrl()}/file/resource/station.json` as const;
  }
}
