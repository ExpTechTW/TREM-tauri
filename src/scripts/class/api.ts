import EventEmitter from "events";
import Route from "./route.js";

export interface StationInfo {
  code: number;
  lat: number;
  lon: number;
  time: string;
}

export interface Station {
  net: string;
  info: StationInfo[];
  work: boolean;
}

export interface WebSocketConnectionConfig {
  type?: string,
  key?: string,
  service?: ("trem.rts" | "websocket.eew" | "websocket.report" | "websocket.tsunami" | "trem.intensity" | "cwa.intensity")[],
};

export interface PartialReport {
  id: string;
  lon: number;
  lat: number;
  loc: string;
  depth: number;
  mag: number;
  int: number;
  time: number;
  trem: number;
  no: number;
  md5: string;
};

export interface StationIntensity {
  station: string;
  lat: number;
  lon: number;
  int: number;
};

export interface AreaIntensity {
  area: string;
  int: number;
  stations: StationIntensity[];
};

export interface Report extends Omit<PartialReport, "md5"> {
  list: AreaIntensity[];
};

export interface RtsStation {
  pga: number;
  pgv: number;
  i: number;
  I: number;
};

export interface Rts {
  station: Record<string, RtsStation>;
  box: Record<string, number[][]>;
  time: number;
};

export interface Ntp {
  type: "ntp";
  time: number;
  version: number;
}

export enum WebSocketCloseCode {
  InsufficientPermission = 4000,
};

export const Intensity = [
  { value: 0, label: "0", text: "０級" },
  { value: 1, label: "1", text: "１級" },
  { value: 2, label: "2", text: "２級" },
  { value: 3, label: "3", text: "３級" },
  { value: 4, label: "4", text: "４級" },
  { value: 5, label: "5-", text: "５弱" },
  { value: 6, label: "5+", text: "５強" },
  { value: 7, label: "6-", text: "６弱" },
  { value: 8, label: "6+", text: "６強" },
  { value: 9, label: "7", text: "７級" }
] as const;

export enum WebSocketEvent {
  Eew = "eew",
  Info = "info",
  Ntp = "ntp",
  Report = "report",
  Rts = "rts",
  Verify = "verify",
  Close = "close",
};

export declare interface ExpTechApi {
  on(event: WebSocketEvent.Rts, listener: (rts: Rts) => void): this;
  on(event: WebSocketEvent.Eew, listener: (eew: any) => void): this;
  on(event: WebSocketEvent.Ntp, listener: (ntp: Ntp) => void): this;
  on(event: WebSocketEvent.Close, listener: (ev: CloseEvent) => void): this;
}

export class ExpTechApi extends EventEmitter {
  key: string;
  route: Route;
  wsConfig: WebSocketConnectionConfig;
  ws!: WebSocket;

  constructor(key: string = "") {
    super();
    this.key = key;
    this.route = new Route({ key });
    this.wsConfig = {
      type: "start",
      key,
      service: ["trem.rts", "websocket.eew", "websocket.report", "websocket.tsunami", "trem.intensity", "cwa.intensity"],
    };

    if (key) {
      this.#initWebSocket();
    }
  }

  setApiKey(apiKey: string): this {
    this.key = apiKey;
    this.wsConfig.key = apiKey;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(this.wsConfig));
    } else {
      this.#initWebSocket();
    }

    return this;
  }

  #initWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();

    const url = this.route.websocket();

    console.log("[WebSocket] Initializing connection");
    console.log(`[WebSocket] Connecting to ${url}`);

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      console.log("[WebSocket] Socket opened");
      this.ws.send(JSON.stringify(this.wsConfig));
    });

    this.ws.addEventListener("message", (raw) => {
      try {
        const data = JSON.parse(raw.data);

        if (data)
          switch (data.type) {
            case WebSocketEvent.Verify: {
              this.ws.send(JSON.stringify(this.wsConfig));
              break;
            }

            case WebSocketEvent.Info: {
              switch (data.data.code) {
                case 200:
                  if (!data.data.list.length) {
                    this.ws.close(WebSocketCloseCode.InsufficientPermission);
                    break;
                  }

                  break;
                case 503:
                  setTimeout(() => this.ws.send(JSON.stringify(this.wsConfig)), 5_000);
                  break;
              }
              break;
            }

            case "data": {
              switch (data.data.type) {
                case WebSocketEvent.Rts:
                  this.emit(WebSocketEvent.Rts, data.data.data);
                  break;
                case WebSocketEvent.Eew:
                  this.emit(WebSocketEvent.Eew, data.data.data);
                  break;
              }
              break;
            }

            case WebSocketEvent.Ntp: {
              console.log(data);

              this.emit(WebSocketEvent.Ntp, data);
              break;
            }
          }
      } catch (error) {
        console.error("[WebSocket]", error);
      }
    });

    this.ws.addEventListener("close", (ev) => {
      console.log("[WebSocket] Socket closed");
      this.emit(WebSocketEvent.Close, ev);

      if (ev.code != WebSocketCloseCode.InsufficientPermission) setTimeout(this.#initWebSocket.bind(this), 5_000);
    });

    this.ws.addEventListener("error", (err) => {
      console.error("[WebSocket]", err);
    });
  }

  /**
   * Inner get request wrapper
   * @param {string} url
   * @returns {Promise<any>}
   */
  async #get(url: string): Promise<any> {
    try {
      const ac = new AbortController();
      const request = new Request(url, {
        method: "GET",
        cache: "default",
        signal: ac.signal,
        headers: {
          // TODO: Replace User-Agent with a variable
          "User-Agent": "TREM-Lite/v2.0.0",
          "Accept": "application/json",
        },
      });

      const abortTimer = setTimeout(() => ac.abort(), 2_500);
      const res = await fetch(request);
      clearTimeout(abortTimer);

      if (!res.ok)
        throw new Error(`Server returned ${res.status}`);

      return await res.json();
    } catch (error) {
      throw new Error(`Request timed out after 2500ms`);
    }
  }

  async getStations(): Promise<Record<string, Station>> {
    const url = this.route.station();

    try {
      return await this.#get(url);
    } catch (error) {
      throw new Error(`Failed to get station data. ${error}`);
    }
  }

  /**
   * Get list of earthquake reports.
   * @param {number} [limit]
   * @returns {Promise<PartialReport[]>}
   */
  async getReports(limit?: number): Promise<PartialReport[]> {
    const url = this.route.earthquakeReportList(limit);

    try {
      const data = await this.#get(url);

      for (const report of data)
        report.no = +report.id.split("-")[0];

      return data;
    } catch (error) {
      throw new Error(`Failed to get reports. ${error}`);
    }
  }

  /**
   * Get a specific earthquake report.
   * @param {string} id Report identifier
   * @returns {Promise<Report>}
   */
  async getReport(id: string): Promise<Report> {
    const url = this.route.earthquakeReport(`${id}`);

    try {
      const data = await this.#get(url);
      data.no = +data.id.split("-")[0];
      data.int = Object.keys(data.list)
        .reduce((acc, key) => data.list[key].int > acc ? data.list[key].int : acc, 0);
      data.list = Object.keys(data.list)
        .map(key => ({
          area: key,
          int: data.list[key].int,
          stations: Object.keys(data.list[key].town)
            .map(k => ({
              ...data.list[key].town[k],
              station: k
            }))
            .sort((a, b) => b.int - a.int)
        }))
        .sort((a, b) => b.int - a.int);

      return data;
    } catch (error) {
      throw new Error(`Failed to get report ${id}. ${error}`);
    }
  }

  /**
   * Get realtime station data.
   * @param {number} [time=Date.now()] Specify ime
   * @returns {Promise<Rts>}
   */
  async getRts(time: number = Date.now()): Promise<Rts> {
    const url = this.route.rts(`${time}`);

    try {
      return await this.#get(url);
    } catch (error) {
      throw new Error(`Failed to fetch rts data. ${error}`);
    }
  }
}