import { createStore } from "vuex";
import { mpvsocket } from "./mpvsocket.module";
import { settings } from "./settings.module";
import { app } from "./app.module";

export const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    settings,
    mpvsocket,
    app,
  },
});
