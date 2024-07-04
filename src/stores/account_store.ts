import { defineStore } from "pinia";

type Account = {
  email: string;
  pass: string;
  name: string;
};

interface AccountState {
  list: Record<string, Account>;
  currentToken: string | null;
}

export const useAccountStore = defineStore("account", {
  state: () => {
    return {
      list: {},
      currentToken: null
    } as AccountState;
  },
  getters: {
    current(state) {
      if (state.currentToken && state.list[state.currentToken]) {
        const account = state.list[state.currentToken];
        if (account) {
          return account;
        }
      }

      return null;
    }
  }
});