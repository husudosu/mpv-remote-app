import { createApp } from "vue";
import Container from "./Container.vue";
import router from "./router";
import { store } from "./store";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/darkmode.css";

document.body.classList.toggle("dark", true);

import {
  defineCustomElements as jeepSqlite,
  applyPolyfills,
} from "jeep-sqlite/loader";

applyPolyfills().then(() => {
  jeepSqlite(window);
});
window.addEventListener("DOMContentLoaded", async () => {
  const app = createApp(Container).use(IonicVue).use(router).use(store);
  await store.dispatch("settings/initSQLITE");
  await store.dispatch("settings/loadSettings");
  router.isReady().then(() => {
    app.mount("#app");
  });
});

// const app = createApp(Container)
//   .use(IonicVue, {
//     platform: {
//       /** The default `desktop` function returns false for devices with a touchscreen.
//        * This is not always wanted, so this function tests the User Agent instead.
//        **/
//       desktop: (win) => {
//         const isMobile =
//           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//             win.navigator.userAgent
//           );
//         return !isMobile;
//       },
//     },
//   })
//   .use(router)
//   .use(store);
