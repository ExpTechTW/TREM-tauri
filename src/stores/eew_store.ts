import { defineStore } from "pinia";
import type { EewType } from "@exptechtw/api-wrapper";

export const useEewStore = defineStore("eew", {
  state: () => ({ eew: {} } as { eew: Record<string, EewType>; }),
});