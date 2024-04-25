import { defineStore } from "pinia";
import type { Map as MaplibreMap } from "maplibre-gl";

export const useMapStore = defineStore("map", {
  state: () => ({ value: undefined } as { value?: MaplibreMap; }),
  getters: {
    map(state) {
      return state.value as MaplibreMap | undefined;
    }
  }
});