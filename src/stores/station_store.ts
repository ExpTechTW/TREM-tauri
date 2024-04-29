import { defineStore } from "pinia";
import type { Station } from "@exptechtw/api-wrapper";

export const useStationStore = defineStore("station", {
  state: () => ({ value: {} } as { value: Record<string, Station>; }),
  getters: {
    station(state) {
      return state.value;
    }
  }
});