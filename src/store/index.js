import { createStore } from "vuex";
// import { socket } from "../main";
import { mpvsocket } from "./mpvsocket.module";

export const store = createStore({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        mpvsocket
    },
});


// socket.on("connect", () => {
//     console.log("connect")
// });