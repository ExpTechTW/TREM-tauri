import { defineStore } from "pinia";
import type { Rts } from "#/@exptechtw/api-wrapper/dist/types";

export const useRtsStore = defineStore("rts", {
  state: () => ({ box: {}, int: [], station: {}, time: 0 } as Rts),
});