import type { EewType } from "@exptechtw/api-wrapper";
import { ExpTechApi } from "./class/api";
import { useEewStore } from "./stores/eew_store";
import { useRtsStore } from "./stores/rts_store";

const api = new ExpTechApi();

export default {
  api,
  init() {
    const eewStore = useEewStore();
    const rtsStore = useRtsStore();

    window.setInterval(() => {
      api.getRts().then((v) => {
        if (v.time < rtsStore.time) {
          return;
        }
        rtsStore.$patch(v);
      });
      api.getEew().then((v) => {
        eewStore.$patch({
          eew: v.reduce(
            (acc, e) => (acc[e.id] = e, acc),
            {} as Record<string, EewType>
          )
        });
      });
    }, 1000);
  }
};