import type { Eew, EewSource, EewStatus } from "./scripts/class/api";

export interface LastNtp {
  server: number;
  client: number;
}

export interface DefaultSettingSchema {
  api: {
    key: string;
  };
  behavior: {
    showWindowWhenEew: boolean;
    openExternal: boolean;
  };
  location: {
    lng: number;
    lat: number;
  };
  audio: {
    enabled: boolean;
    theme: string;
  };
}

export interface LngLatObject {
  lng: number;
  lat: number;
}

export interface NtpTime {
  remote: number;
  server: number;
  client: number;
}

export type DistanceToEpicenter = number;
export type SurfaceDistanceToEpicenter = number;

/**
 * 基礎地震速報事件結構
 */
interface BaseEewEvent {
  /**
   * 震波半徑
   */
  r: { p: number; s: number };
  /**
   * 預估震波抵達所在地秒數
   */
  t?: { p: number; s: number };
  /**
   * 預估所在地震度
   */
  i?: number;
  /**
   * 震央經度
   */
  lng: number;
  /**
   * 震央緯度
   */
  lat: number;
  /**
   * 震央位置
   */
  location: string;
  /**
   * 地震規模
   */
  magnitude: number;
  /**
   * 地震深度
   */
  depth: number;
  /**
   * 地震速報報號
   */
  serial: number;
  /**
   * 地震速報來源機關
   */
  source: EewSource;
  detail: 0 | 1;
  /**
   * 地震速報狀態
   */
  status: EewStatus;
  /**
   * 各地預估震度
   */
  int: Record<string, number>;
  /**
   * 預估最大震度
   */
  max: number;
  /**
   * 是否為最終報
   */
  final: boolean;
  /**
   * 是否取消
   */
  cancel: boolean;
  /**
   * 預估地震發生時間
   */
  time: number;
  /**
   * 所在地到震央地表距離
   */
  surface?: SurfaceDistanceToEpicenter;
  /**
   * 所在地到震源距離
   */
  distance?: DistanceToEpicenter;
  /**
   * API 原始資料
   */
  raw: Eew;
}

/**
 * Nsspe 地震預警事件
 */
export interface NsspeEvent extends BaseEewEvent {
  source: EewSource.Trem;
  detail: 0;
}

/**
 * 地震速報事件
 */
export type EewEvent = BaseEewEvent | NsspeEvent;

export enum AudioType {
  Eew = "eew",
  CwaEew = "cwa",
  Update = "update",
}
