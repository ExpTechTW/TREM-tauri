<script setup lang="ts">
import ViewPanel from "@/components/misc/ViewPanel.vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Chip from "primevue/chip";
import Divider from "primevue/divider";
import InputText from "primevue/inputtext";
import Password from "primevue/password";

import Global from "@/global";

import { version as appVersion } from "~/package.json";

import { onMounted, ref } from "vue";
import { useAccountStore } from "@/stores/account_store";
import { useRouter } from "vue-router";
import { hostname, version } from "@tauri-apps/plugin-os";

const accountStore = useAccountStore();
const router = useRouter();
const email = ref("");
const password = ref("");
const name = ref("");
const remember = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const nameError = ref<string | null>(null);

const login = async () => {
  isLoading.value = true;
  error.value = null;
  nameError.value = null;

  const nameInfoString = `/TREM-tauri/${appVersion}/${await version()}`;
  const nameString = `${name.value}${nameInfoString}`;

  if (nameString.length > 50) {
    nameError.value = `名稱長度必須小於 ${50 - nameInfoString.length} 個字元`;
    isLoading.value = false;
    return;
  }

  try {
    const token = await Global.api.getAuthToken({
      email: email.value,
      password: password.value,
      name: nameString,
    });

    if (remember.value) {
      accountStore.$patch({
        list: {
          [token]: {
            email: email.value,
            pass: password.value,
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

    isLoading.value = false;
  }
};

onMounted(() => {
  hostname().then((v) => (name.value = v ?? ""));
});
</script>

<template>
  <div id="login">
    <ViewPanel title="登入">
      <form class="form-container" @submit.prevent="login">
        <div class="input-field">
          <label for="account-email-input" class="input-label">
            電子郵件
            <span class="text-red-600 dark:text-red-400">*</span>
          </label>
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
          <label for="account-password-input" class="input-label">
            密碼
            <span class="text-red-600 dark:text-red-400">*</span>
          </label>
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
            :invalid="nameError != null"
            :loading="isLoading"
            :disabled="isLoading"
          />
          <transition name="fade">
            <small v-if="nameError" class="error-message">
              {{ nameError }}
            </small>
          </transition>
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
      <Divider v-if="Object.keys(accountStore.list).length" />
      <Chip v-for="account in accountStore.list" :label="account.name" />
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
  transition: color 0.1s ease-in-out;
}

.input-label:has(+ input:focus),
.input-label:has(+ div input:focus) {
  color: var(--p-primary-color);
}

.input-label:has(+ input.p-invalid),
.input-label:has(+ div input.p-invalid) {
  color: var(--p-form-field-invalid-border-color);
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
