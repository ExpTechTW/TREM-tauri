import { ExpTechApi } from "./class/api";
import { useRtsStore } from "./stores/rts_store";

const api = new ExpTechApi();

export default {
  api,
  init() {
    const rtsStore = useRtsStore();

    window.setInterval(() => {
      api.getRts().then((v) => {
        rtsStore.$patch(v);
      });
    }, 1000);
  }
};