import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';


import {store} from './store'


import SocketIO from "socket.io-client";

export const socket = SocketIO("http://192.168.88.4:8000", {
  timeout: 1000,
  wsEngine: 'ws',
  transportOptions: {
    polling: {
      extraHeaders: {
        "X-Username": 'sudosu',
      },
    },
  },
});

setInterval(() => {
  console.log("Refreshing playback")
  socket.emit("playbackTime")
}, 1500);

socket.on("connect", () => {
  store.commit("mpvsocket/setConnectState", true);
  console.log("Socket connected");
  // socket.emit("player_data", (data) => {
  //   store.commit("mpvsocket/setPlayerData", data);
  // });
  console.log("User connected");
});

socket.on("disconnect", () => {
  store.commit("mpvsocket/setConnectState", false);
  console.log("User disconnect");
});

socket.on("client_count", (data) => {
  console.log(data);
});

// socket.on("playback_time_property", (data) => {
//   store.commit("mpvsocket/setPlayback", data);
// });

socket.on("pause", (data) => {
  console.log(`Paused trigger from server ${data}`)
  store.commit("mpvsocket/setPause", data);
});

// On new file opened
socket.on("playerData", (data) => {
  store.commit("mpvsocket/setPlayerData", data);
  console.log(data);
});

socket.on("playbackTimeResponse", (data) => {
  console.log(data);
  store.commit("mpvsocket/setPlayback", data);
});

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(store);
  
router.isReady().then(() => {
  app.mount('#app');
});