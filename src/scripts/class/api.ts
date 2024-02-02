import EventEmitter from "events";
import Route from"./route.js";

export interface WebSocketConnectionConfig {
  type    ?: string,
  key     ?: string,
  service ?: ("trem.rts" | "websocket.eew" | "websocket.report" | "websocket.tsunami" | "trem.intensity" | "cwa.intensity")[],
}

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
}

export interface StationIntensity {
  lat: number;
  lon: number;
  int: number;
}

export interface AreaIntensity {
  int: number;
  town: Record<string, StationIntensity>;
}

export interface Report extends Omit<PartialReport, "int" | "md5"> {
  list: Record<string, AreaIntensity>;
}

export interface RtsStation {
  pga: number;
  pgv: number;
  i: number;
  I: number;
}

export interface Rts {
  station: Record<string, RtsStation>;
  box: Record<string, number[][]>;
  time: number;
}

export enum WebSocketCloseCode {
  InsufficientPermission = 4000,
}

export enum WebSocketEvent {
  Eew    = "eew",
  Info   = "info",
  Ntp    = "ntp",
  Report = "report",
  Rts    = "rts",
  Verify = "verify",
  Close  = "close",
}

export class ExpTechApi extends EventEmitter {
  private _key!: string;
  wsConfig: WebSocketConnectionConfig;
  route: Route;
  ws!: WebSocket;
  
  constructor(key: string = "") {
    super();
    this.key = key;
    this.route = new Route({ key });
    this.wsConfig = {
      type    : "start",
      key     : key,
      service : ["trem.rts", "websocket.eew", "websocket.report", "websocket.tsunami", "trem.intensity", "cwa.intensity"],
    }
    this.#initWebSocket();
  }

  get key() {
    return this._key;
  }

  set key(val) {
    this._key = val;
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
        console.debug(data);

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
                  this.emit(WebSocketEvent.Rts, data.data);
                  break;
                case WebSocketEvent.Eew:
                  this.emit(WebSocketEvent.Eew, data.data);
                  break;
              }
              break;
            }

            case WebSocketEvent.Ntp: {
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
        method  : "GET",
        cache   : "default",
        signal  : ac.signal,
        headers : {
          // TODO: Replace User-Agent with a variable
          "User-Agent" : "TREM-Lite/v2.0.0",
          "Accept"     : "application/json",
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

  async getStations() {
    const url = "https://data.exptech.com.tw/file/resource/station.json";

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
   * @param {number} id Report number
   * @returns {Promise<Report>}
   */
  async getReport(id: number): Promise<Report> {
    const url = this.route.earthquakeReport(`${id}`);

    try {
      const data = await this.#get(url);
      data.no = +data.id.split("-")[0];

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