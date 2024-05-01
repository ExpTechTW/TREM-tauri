import { defineStore } from "pinia";
import type { PartialReport, Report } from "@exptechtw/api-wrapper";

export const useReportStore = defineStore("report", {
  state: () => ({ partial: new Map<string, PartialReport>(), cache: new Map<string, Report>() }),
  actions: {
    set(report: Report) {
      this.cache.set(report.id, report);
    }
  },
  getters: {
    list: (state) => Array.from(state.partial.values()),
  }
});