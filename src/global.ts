import type { EewType } from "@exptechtw/api-wrapper";
import { ExpTechApi } from "./class/api";
import { useEewStore } from "./stores/eew_store";
import { useRtsStore } from "./stores/rts_store";
import { appDataDir } from "@tauri-apps/api/path";
import { Stronghold, type Client } from "@tauri-apps/plugin-stronghold";

const api = new ExpTechApi();

const vaultPassword = import.meta.env.VITE_STRONGHOLD_PASS;

const stronghold = await Stronghold.load(`${await appDataDir()}/vault.hold`, vaultPassword);

let client: Client;

try {
  client = await stronghold.loadClient("account");
} catch {
  client = await stronghold.createClient("account");
}

export default {
  api,
  client,
  stronghold,
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