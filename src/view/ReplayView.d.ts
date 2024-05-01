import type { EewSource, EewType, Rts } from "@exptechtw/api-wrapper";

export type Events = {
  frame: number;
  type: EewSource | "rts" | "nsspe";
  label: string;
};

export type RtsEewData = {
  rts: Rts;
  eew: EewType[];
  time: number;
};

export type RtsFrame = {
  type: "rts";
  data: Rts;
  time: number;
  sound: string[];
};

export type EewFrame = {
  type: "eew";
  data: EewType;
  time: number;
  sound: string[];
};

export type Frame = RtsFrame | EewFrame;