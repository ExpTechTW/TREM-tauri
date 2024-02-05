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
    openExternal: boolean;
  };
  location: {
    lng: number;
    lat: number;
  };
  audio: {
    theme: string;
  };
}

export interface LngLatObject {
  lng: number;
  lat: number;
}

export interface NtpTime {
  server: number;
  client: number;
}

export interface EewEvent {
  r: { p: number; s: number; };
  t?: { p: number; s: number; };
  i?: number;
  lng: number;
  lat: number;
  location: string;
  magnitude: number;
  depth: number;
  serial: number;
  source: EewSource;
  status: EewStatus;
  int: Record<string, number>;
  max: number;
  final: boolean;
  cancel: boolean;
  time: number;
  raw: Eew;
}

export type DistanceToEpicenter = number;
export type SurfaceDistanceToEpicenter = number;

export enum AudioType {
  Eew = "eew",
  CwaEew = "cwa",
  Update = "update",
}
