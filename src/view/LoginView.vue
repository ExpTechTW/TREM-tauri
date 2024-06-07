<script setup lang="ts">
import ViewPanel from "@/components/misc/ViewPanel.vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import Password from "primevue/password";

import Global from "@/global";

import { version as appVersion } from "~/package.json";

import { ref } from "vue";
import { useAccountStore } from "@/stores/account_store";
import { useRouter } from "vue-router";
import { hostname, platform, version, arch } from "@tauri-apps/plugin-os";

const accountStore = useAccountStore();
const router = useRouter();
const email = ref("");
const password = ref("");
const name = ref("");
const remember = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

const login = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const token = await Global.api.getAuthToken({
      email: email.value,
      password: password.value,
      name: `${
        name.value || (await hostname())
      }/TREM-tauri/${appVersion}/${await platform()}_${await version()}_${await arch()}`,
    });

    if (remember.value) {
      accountStore.$patch({
        list: {
          [token]: {
            email: email.value,
            password: password.value,
            name: name.value,
          },
        },
      });
    }

    accountStore.$patch({
      currentToken: token,
    });

    router.replace("/account");
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("400")) {
        error.value = `電子郵件或密碼錯誤`;
      } else {
        error.value = `發生未知錯誤`;
      }
    }

    console.log(e);
    isLoading.value = false;
  }
};
</script>

<template>
  <div id="login">
    <ViewPanel title="登入">
      <form class="form-container" @submit.prevent="login">
        <div class="input-field">
          <label for="account-email-input" class="input-label">電子郵件*</label>
          <InputText
            v-model="email"
            id="account-email-input"
            autocomplete="email"
            required
            :invalid="error != null"
            :loading="isLoading"
            :disabled="isLoading"
          />
          <transition name="fade">
            <small v-if="error" class="error-message">{{ error }}</small>
          </transition>
        </div>
        <div class="input-field">
          <label for="account-password-input" class="input-label">密碼*</label>
          <Password
            v-model="password"
            input-id="account-password-input"
            toggle-mask
            required
            autocomplete="current-password"
            :feedback="false"
            :invalid="error != null"
            :loading="isLoading"
            :disabled="isLoading"
          />
          <transition name="fade">
            <small v-if="error" class="error-message">{{ error }}</small>
          </transition>
        </div>
        <div class="input-field">
          <label for="account-name-input" class="input-label">名稱</label>
          <InputText
            v-model="name"
            id="account-name-input"
            autocomplete="username"
            :loading="isLoading"
            :disabled="isLoading"
          />
        </div>
        <div class="field">
          <Checkbox
            v-model="remember"
            input-id="remember-credentials-input"
            binary
            :disabled="isLoading"
          />
          <label for="remember-credentials-input">記住登入資訊</label>
        </div>
        <Button
          label="登入"
          type="submit"
          :loading="isLoading"
          :disabled="isLoading"
        />
      </form>
    </ViewPanel>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.input-label {
  font-size: smaller;
}

.field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-message {
  padding-left: 4px;
  color: var(--p-form-field-invalid-border-color);
}

.fade-enter-active {
  transition: opacity 250ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
