import { createStore } from "vuex";
import { mpvsocket } from "./mpvsocket.module";
import { settings } from "./settings.module";

export const store = createStore({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        settings,
        mpvsocket,
    },
});
