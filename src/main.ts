import { getCurrent } from "@tauri-apps/api/webviewWindow";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { createPinia } from "pinia";
import PrimeVue from 'primevue/config';
import Aura from 'primevue/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import FocusTrap from "primevue/focustrap";
import Ripple from 'primevue/ripple';
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";

import App from "./App.vue";

import "./styles.css";

import MainRoute from "@/routes/MainRoute.vue";
import AccountView from "./view/AccountView.vue";
import ConfigView from "@/view/ConfigView.vue";
import EarthquakeView from "./view/EarthquakeView.vue";
import LoginView from "@/view/LoginView.vue";
import ReportListView from "@/view/ReportListView.vue";
import ReportView from "@/view/ReportView.vue";
import ReplayView from "./view/ReplayView.vue";

const win = getCurrent();

const pinia = createPinia();

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/",
      component: MainRoute,
      meta: {
        title: "TREM Tauri"
      },
      children: [
        {
          path: "/",
          components: {
            stack: EarthquakeView
          },
        },
        {
          path: "/report",
          components: {
            navigation: ReportListView
          },
        },
        {
          path: "/report/:id",
          components: {
            stack: ReportView
          },
        },
        {
          path: "/replay",
          components: {
            stack: ReplayView
          },
        },
        {
          path: "/config",
          components: {
            navigation: ConfigView,
            stack: EarthquakeView
          },
        },
        {
          path: "/account", components: {
            navigation: AccountView,
            stack: EarthquakeView
          },
        },
        {
          path: "/account/login", components: {
            navigation: LoginView,
            stack: EarthquakeView
          },
        },
      ]
    },
  ]
});

router.beforeEach((to, _, next) => {
  if (typeof to.meta.title == "string") {
    win.setTitle(to.meta.title);
  }

  next();
});

createApp(App)
  .use(pinia)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura
    },
    ripple: true,
  })
  .use(ConfirmationService)
  .use(ToastService)
  .directive("focustrap", FocusTrap)
  .directive("ripple", Ripple)
  .directive("tooltip", Tooltip)
  .mount("#app");