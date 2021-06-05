import { createStore } from "vuex";
// import { socket } from "../main";
import { mpvsocket } from "./mpvsocket.module";
import { settings } from './settings.module'

export const store = createStore({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        settings,
        mpvsocket,
    },
});


// socket.on("connect", () => {
//     console.log("connect")
// });