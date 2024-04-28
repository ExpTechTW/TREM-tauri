import type { Eew, EewSource, Rts } from "#/@exptechtw/api-wrapper/dist/types";

export type Events = {
  frame: number;
  timestamp: number;
  type: EewSource | "rts";
};

export type RtsEewData = {
  rts: Rts;
  eew: Eew[];
  time: number;
};

export type RtsFrame = {
  type: "rts";
  data: Rts;
  time: number;
};

export type EewFrame = {
  type: "eew";
  data: Eew;
  time: number;
};

export type Frame = RtsFrame | EewFrame;