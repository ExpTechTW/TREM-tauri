export class Route {
  static get lbUrl() {
    return `https://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw` as const;
  }

  static get apiUrl() {
    return `https://api-${Math.ceil(Math.random() * 2)}.exptech.com.tw` as const;
  }

  static get station() {
    return "https://raw.githubusercontent.com/ExpTechTW/API/master/resource/station.json" as const;
  }

  static reportList(limit = 50) {
    return `${Route.apiUrl}/api/v2/eq/report?limit=${limit}` as const;
  }

  static report(id: string) {
    return `${Route.apiUrl}/api/v2/eq/report/${id}` as const;
  }

  static rts(time?: number) {
    if (time) {
      return `${Route.lbUrl}/api/v1/trem/rts/${time}` as const;
    }

    return `${Route.lbUrl}/api/v1/trem/rts` as const;
  }

  static eew(time?: number) {
    if (time) {
      return `${Route.lbUrl}/api/v1/eq/eew/${time}` as const;
    }

    return `${Route.lbUrl}/api/v1/eq/eew` as const;
  }
}