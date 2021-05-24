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

export const socket = SocketIO("http://localhost:8000", {
  transportOptions: {
    polling: {
      extraHeaders: {
        "X-Username": 'sudosu',
      },
    },
  },
});


const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(store)

  
router.isReady().then(() => {
  app.mount('#app');
});

socket.on('connect', () => {
  store.commit('mpvsocket/setConnectState', true)

  setInterval(() => {
    socket.emit('get_player_props', (response) => {
      store.commit("mpvsocket/setPlayerData", response);
    })
  }, 1000)

})

socket.on('disconnect', () => {
  store.commit("mpvsocket/setConnectState", false);
})