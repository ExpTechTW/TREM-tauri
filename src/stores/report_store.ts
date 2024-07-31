import { defineStore } from "pinia";
import type { PartialReport, Report } from "@exptechtw/api-wrapper";

type ReportStoreState = {
  partial: PartialReport[];
  cache: Map<string, Report>;
};

export const useReportStore = defineStore("report", {
  state: (): ReportStoreState => ({
    partial: [],
    cache: new Map<string, Report>(),
  }),
  actions: {
    update(list: PartialReport[]) {
      const oldIdList = this.partial.map((v) => v.id);

      list.filter((r) => !oldIdList.includes(r.id));

      list = [...this.partial, ...list];

      list.sort((a, b) => b.time - a.time);

      this.partial = list;
    },
    setReport(id: string, report: Report) {
      this.cache.set(id, report);
    },
  },
  getters: {
    list: (state) => Array.from(state.partial.values()),
  },
});
