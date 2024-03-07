/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import { debug, error, info } from "@tauri-apps/plugin-log";
import { fetch, type ClientOptions } from "@tauri-apps/plugin-http";
import EventEmitter from "events";

import Route from "./route";

import Code from "../../assets/json/code.json";

/**
 * 測站資訊
 */
export interface StationInfo {
  /**
   * 測站郵遞區號 (地區編號)
   */
  code: keyof typeof Code;
  /**
   * 測站經度
   */
  lon: number;
  /**
   * 測站緯度
   */
  lat: number;
  /**
   * 測站安裝時間
   */
  time: string;
}

/**
 * TREM 測站
 */
export interface Station {
  /**
   * 測站種類
   */
  net: string;
  /**
   * 測站資訊
   */
  info: StationInfo[];
  city: string;
  town: string;
  /**
   * 測站是否運作
   */
  work: boolean;
}

export interface WebSocketConnectionConfig {
  type?: string;
  key?: string;
  service?: (
    | "trem.rts"
    | "websocket.eew"
    | "websocket.report"
    | "websocket.tsunami"
    | "trem.intensity"
    | "cwa.intensity"
  )[];
}

/**
 * 部分地震報告
 */
export interface PartialReport {
  /**
   * 地震報告 ID
   */
  id: string;
  /**
   * 地震震央經度
   */
  lon: number;
  /**
   * 地震震央緯度
   */
  lat: number;
  /**
   * 地震位置敘述
   */
  loc: string;
  /**
   * 地震深度
   */
  depth: number;
  /**
   * 地震芮氏規模
   */
  mag: number;
  /**
   * 地震觀測最大震度
   */
  int: number;
  /**
   * 地震發生時間
   */
  time: number;
  /**
   * TREM 觀測網 ID
   */
  trem: number;
  /**
   * 地震報告編號
   */
  no: number;
  /**
   * 地震報告完整性
   */
  md5: string;
}

/**
 * 測站觀測資料
 */
export interface StationIntensity {
  /**
   * 測站名稱
   */
  station: string;
  /**
   * 測站經度
   */
  lon: number;
  /**
   * 測站緯度
   */
  lat: number;
  /**
   * 測站最大觀測震度
   */
  int: number;
}

/**
 * 區域觀測資料
 */
export interface AreaIntensity {
  /**
   * 區域名稱
   */
  area: string;
  /**
   * 區域最大觀測震度
   */
  int: number;
  /**
   * 區域內測站觀測資料
   */
  stations: StationIntensity[];
}

/**
 * 地震報告
 */
export interface Report extends Omit<PartialReport, "md5"> {
  /**
   * 各地觀測最大震度
   */
  list: AreaIntensity[];
}

/**
 * 測站地動資料
 */
export interface RtsStation {
  /**
   * 地動加速度
   */
  pga: number;
  /**
   * 地動速度
   */
  pgv: number;
  /**
   * 即時震度
   */
  i: number;
  /**
   * 衰減震度
   */
  I: number;
  /**
   * 測站是否觸發
   */
  alert: boolean;
}

export type Box = Record<string, number>;

export interface IntensityListing {
  code: keyof typeof Code;
  area: string;
  station: string;
  i: number;
}

/**
 * 地動資料
 */
export interface Rts {
  /**
   * 測站地動資料
   */
  station: Record<string, RtsStation>;
  /**
   * 地動區塊
   */
  box: Box;
  /**
   * 資料時間
   */
  time: number;
  /**
   * 震度列表
   */
  int: IntensityListing[];
  replay?: boolean;
}

/**
 * 地震速報來源機關
 */
export enum EewSource {
  /**
   * 交通部中央氣象署
   * @link https://www.cwa.gov.tw
   */
  Cwa = "cwa",
  /**
   * 기상청 날씨누리
   * @link https://www.kma.go.kr
   */
  Kma = "kma",
  /**
   * 気象庁
   * @link https://www.jma.go.jp
   */
  Jma = "jma",
  /**
   * 防災科研
   * @link https://www.bosai.go.jp
   */
  Nied = "nied",
  /**
   * 四川省地震局
   * @link https://www.scdzj.gov.cn
   */
  Scdzj = "scdzj",
  /**
   * TREM 臺灣即時地震監測
   * @link https://www.exptech.com.tw
   */
  Trem = "trem",
}

/**
 * 地震速報狀態
 */
export enum EewStatus {
  /**
   * 注意報
   */
  Warn = 0,
  /**
   * 警報
   */
  Alert = 1,
  /**
   * 取消報
   */
  Cancel = 2,
  /**
   * 測試報
   */
  Test = 3,
}

interface BaseEewDetail {
  /**
   * 地震速報時間
   */
  time: number;
  /**
   * 地震震央預估經度
   */
  lon: number;
  /**
   * 地震震央預估緯度
   */
  lat: number;
  /**
   * 地震預估深度
   */
  depth: number;
  /**
   * 地震預估芮氏規模
   */
  mag: number;
  /**
   * 地震預估位置
   */
  loc: string;
  /**
   * 地震預估最大震度
   */
  max: number;
  /**
   * 覆蓋預估震度
   */
  area?: Record<string, string[]>;
}

/**
 * 基礎地震速報結構
 */
export interface BaseEew {
  type: "eew";
  /**
   * 地震速報來源機關
   */
  author: EewSource;
  /**
   * 地震速報 ID
   */
  id: string;
  /**
   * 地震速報報號
   */
  serial: number;
  /**
   * 地震速報狀態
   */
  status: EewStatus;
  /**
   * 地震速報是否為最終報
   */
  final: 1 | 0;
  /**
   * 地震速報參數
   */
  eq: BaseEewDetail;
  timestamp: number;
  data_unit: "websocket";
  delay: number;
  replay?: boolean;
}

/**
 * 交通部中央氣象署地震速報
 */
export interface CwaEew extends BaseEew {
  author: EewSource.Cwa;
}

/**
 * TREM 地震速報
 */
export interface TremEew extends BaseEew {
  author: EewSource.Trem;
  detail: 1;
}

/**
 * Nsspe 地震預警
 */
export interface NsspeEew extends BaseEew {
  author: EewSource.Trem;
  detail: 0;
  level: number;
  reason: number;
  trigger: number;
  eq: BaseEewDetail & {
    area: Record<string, string[]>;
  };
}

/**
 * 地震速報
 */
export type Eew = CwaEew | TremEew | NsspeEew;

/**
 * 校時
 */
export interface Ntp {
  type: "ntp";
  /**
   * 伺服器時間
   */
  time: number;
  /**
   * 校時板本
   */
  version: number;
}

export enum WebSocketCloseCode {
  Normal = 1000,
  AbnormalClosure = 1006,
  InsufficientPermission = 4000,
}

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
  { value: 9, label: "7", text: "７級" },
] as const;

export enum WebSocketEvent {
  Ready = "ready",
  Eew = "eew",
  Info = "info",
  Ntp = "ntp",
  Report = "report",
  Rts = "rts",
  Verify = "verify",
  Close = "close",
}

export class ExpTechApi extends EventEmitter {
  key: string;
  route: Route;
  wsConfig: WebSocketConnectionConfig;
  ws!: WebSocket;
  _destroyed: boolean;

  constructor(key: string = "") {
    super();
    this.key = key;
    this.route = new Route({ key });
    this.wsConfig = {
      type: "start",
      key,
      service: [
        "trem.rts",
        "websocket.eew",
        "websocket.report",
        "websocket.tsunami",
        "trem.intensity",
        "cwa.intensity",
      ],
    };

    if (key) {
      this.#initWebSocket();
    }

    this._destroyed = false;
  }

  setApiKey(apiKey: string) {
    this.key = apiKey;
    this.wsConfig.key = apiKey;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(this.wsConfig));
    } else {
      this.#initWebSocket();
    }

    return this;
  }

  destroy() {
    this._destroyed = true;
    this.ws.close(1000);
  }

  #initWebSocket() {
    if (this._destroyed) {
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    const url = this.route.websocket();

    info("[WebSocket] Initializing connection");
    info(`[WebSocket] Connecting to ${url}`);

    this.ws = new WebSocket(url);

    this.ws.addEventListener("open", () => {
      info("[WebSocket] Socket opened");
      this.ws.send(JSON.stringify(this.wsConfig));
    });

    this.ws.addEventListener("message", (raw) => {
      try {
        const data = JSON.parse(raw.data);

        if (data) {
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
                  } else {
                    this.emit(WebSocketEvent.Ready);
                  }

                  break;
                case 503:
                  window.setTimeout(
                    () => this.ws.send(JSON.stringify(this.wsConfig)),
                    5_000
                  );
                  break;
              }
              break;
            }

            case "data": {
              switch (data.data.type) {
                case WebSocketEvent.Rts: {
                  this.emit(WebSocketEvent.Rts, data.data.data);
                  break;
                }
                case WebSocketEvent.Eew: {
                  this.emit(WebSocketEvent.Eew, data.data);
                  break;
                }
                case WebSocketEvent.Report: {
                  this.emit(WebSocketEvent.Report, data.data.data);
                  break;
                }
              }
              break;
            }

            case WebSocketEvent.Ntp: {
              this.emit(WebSocketEvent.Ntp, data);
              break;
            }
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          error(`[WebSocket] ${err.message}`);
          if (err.stack) {
            error(err.stack);
          }
        }
      }
    });

    this.ws.addEventListener("close", (ev) => {
      info("[WebSocket] Socket closed");
      this.emit(WebSocketEvent.Close, ev);

      switch (ev.code) {
        case WebSocketCloseCode.Normal:
        case WebSocketCloseCode.InsufficientPermission:
          break;

        default:
          window.setTimeout(this.#initWebSocket.bind(this), 5_000);
          break;
      }
    });

    this.ws.addEventListener("error", () => {
      error(`[WebSocket] Websocet failed to establish a connection to ${url}.`);
    });
  }

  /**
   * Inner get request wrapper
   * @param {string} url
   * @returns {Promise<any>}
   */
  async #get(url: string): Promise<any> {
    const request: RequestInit & ClientOptions = {
      method: "GET",
      connectTimeout: 2500,
      headers: {
        // TODO: Replace User-Agent with a variable
        "User-Agent": "TREM-Lite/v2.0.0",
        Accept: "application/json",
      },
    };

    debug(`[API] Fetching ${url.split(/[?#]/)[0]}`);
    const res = await fetch(url, request);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  }

  async getStations(): Promise<Record<string, Station>> {
    const url = this.route.station();

    try {
      const stations = (await this.#get(url)) as Record<string, Station>;
      for (const id in stations) {
        const station = stations[id];
        const location = Code[station.info[0].code];
        station.city = location?.city;
        station.town = location?.town;
      }

      return stations;
    } catch (error) {
      throw new Error(`Failed to get station data. ${error}`);
    }
  }

  /**
   * 獲取地震報告列表
   * @param {number} [limit]
   * @returns {Promise<PartialReport[]>}
   */
  async getReports(limit?: number): Promise<PartialReport[]> {
    const url = this.route.earthquakeReportList(limit);

    try {
      const data = await this.#get(url);

      for (const report of data) {
        report.no = +report.id.split("-")[0];
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get reports. ${error}`);
    }
  }

  /**
   * 獲取指定地震報告
   * @param {string} id 地震報告 ID
   * @returns {Promise<Report>}
   */
  async getReport(id: string): Promise<Report> {
    const url = this.route.earthquakeReport(`${id}`);

    try {
      const data = await this.#get(url);
      data.no = +data.id.split("-")[0];
      data.int = Object.keys(data.list).reduce(
        (acc, key) => (data.list[key].int > acc ? data.list[key].int : acc),
        0
      );
      data.list = Object.keys(data.list)
        .map((key) => ({
          area: key,
          int: data.list[key].int,
          stations: Object.keys(data.list[key].town)
            .map((k) => ({
              ...data.list[key].town[k],
              station: k,
            }))
            .sort((a, b) => b.int - a.int),
        }))
        .sort((a, b) => b.int - a.int);

      return data;
    } catch (error) {
      throw new Error(`Failed to get report ${id}. ${error}`);
    }
  }

  /**
   * 獲取即時地動資料
   * @param {number} [time=Date.now()] 時間
   * @returns {Promise<Rts>}
   */
  async getRts(time?: number): Promise<Rts> {
    const url = new Route({ version: 1, key: this.key }).rts(time ? `${time}` : "");

    try {
      return await this.#get(url);
    } catch (error) {
      throw new Error(`Failed to fetch rts data. ${error}`);
    }
  }

  /**
   * 獲取地震速報資料
   * @param {number} [time=Date.now()] 時間
   * @returns {Promise<Rts>}
   */
  async getEew(time?: number): Promise<Eew[]> {
    const url = new Route({ version: 1, key: this.key }).eew(time ? `${time}` : "");

    try {
      return await this.#get(url);
    } catch (error) {
      throw new Error(`Failed to fetch eew data. ${error}`);
    }
  }
}

export declare interface ExpTechApi extends EventEmitter {
  /**
   * WebSocket 連線成功
   * @param {WebSocketEvent.Ready} event rts
   * @param {() => void} listener
   */
  on(event: WebSocketEvent.Ready, listener: () => void): this;

  /**
   * 地動資料
   * @param {WebSocketEvent.Rts} event rts
   * @param {(rts: Rts) => void} listener
   */
  on(event: WebSocketEvent.Rts, listener: (rts: Rts) => void): this;

  /**
   * 地震速報資料
   * @param {WebSocketEvent.Eew} event eew
   * @param {(eew: Eew) => void} listener
   */
  on(event: WebSocketEvent.Eew, listener: (eew: Eew) => void): this;

  /**
   * 地震速報資料
   * @param {WebSocketEvent.Ntp} event ntp
   * @param {(ntp: Ntp) => void} listener
   */
  on(event: WebSocketEvent.Ntp, listener: (ntp: Ntp) => void): this;

  /**
   * 地震報告資料
   * @param {WebSocketEvent.Report} event ntp
   * @param {(report: Report) => void} listener
   */
  on(event: WebSocketEvent.Report, listener: (report: Report) => void): this;

  /**
   * @param {WebSocketEvent.Close} event close
   * @param {(ev: CloseEvent) => void} listener
   */
  on(event: WebSocketEvent.Close, listener: (ev: CloseEvent) => void): this;
}
