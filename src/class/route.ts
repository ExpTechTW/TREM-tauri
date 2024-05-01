interface RouteConfig {
  api: number;
  lb: number;
}

export class Route {
  api: number;
  lb: number;

  constructor(route: Partial<RouteConfig> = {}) {
    this.api = route.api ?? Math.ceil(Math.random() * 2);
    this.lb = route.lb ?? Math.ceil(Math.random() * 4);
  };

  random() {
    this.api = Math.ceil(Math.random() * 2);
    this.lb = Math.ceil(Math.random() * 4);
  }

  get lbUrl() {
    return `https://lb-${this.lb}.exptech.com.tw` as const;
  }

  get apiUrl() {
    return `https://api-${this.api}.exptech.com.tw` as const;
  }

  get station() {
    return "https://raw.githubusercontent.com/ExpTechTW/API/master/resource/station.json" as const;
  }

  reportList(limit = 50) {
    return `${this.apiUrl}/api/v2/eq/report?limit=${limit}` as const;
  }

  report(id: string) {
    return `${this.apiUrl}/api/v2/eq/report/${id}` as const;
  }

  rts(time?: number) {
    if (time) {
      return `${this.lbUrl}/api/v1/trem/rts/${time}` as const;
    }

    return `${this.lbUrl}/api/v1/trem/rts` as const;
  }

  eew(time?: number) {
    if (time) {
      return `${this.lbUrl}/api/v1/eq/eew/${time}` as const;
    }

    return `${this.lbUrl}/api/v1/eq/eew` as const;
  }
}