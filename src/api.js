import axios from "axios";
import { toastController } from "@ionic/core";

import { store } from "./store";
import musicControls from "cordova-plugin-music-controls2/www/MusicControls";

export const MINIMUM_API_VERSION = "1.0.6";

export let apiInstance = axios.create({
  timeout: 10000,
});
let cancelSource = axios.CancelToken.source();
let callsPending = 0;

function requestOnFulfilled(config) {
  config.cancelToken = cancelSource.token;
  callsPending++;
  return config;
}

function requestOnRejected(error) {
  openToast(JSON.stringify(error));
  Promise.reject(error);
}

// FIXME: App still creates musicController when it's disabled on settings.
function handleDisconnect(auto_reconnect = false) {
  if (!auto_reconnect) store.commit("simpleapi/clearPlaybackRefreshInterval");
  store.commit("simpleapi/setConnectedState", false);
  store.commit("simpleapi/clearPlayerData");
  if (store.state.simpleapi.musicControlsActive) {
    console.log("remove music controls");
    store.commit("simpleapi/setMusicControlsActive", false);
    musicControls.destroy();
  }
}

export function disconnect() {
  handleDisconnect();

  if (callsPending > 0) {
    callsPending = 0;
    cancelSource.cancel("Cancel pending requests");
    cancelSource = axios.CancelToken.source();
  }
}

export function configureInstance(host, port) {
  // Before reconfiguration set store states.
  disconnect();
  apiInstance.defaults.baseURL = `http://${host}:${port}/api/v1/`;
  apiInstance.interceptors.request.use(requestOnFulfilled, requestOnRejected);
}

apiInstance.interceptors.response.use(
  async (response) => {
    if (!store.state.simpleapi.connected) {
      store.commit("simpleapi/setConnectedState", true);
      // Get MPV Info
      apiInstance.get("mpvinfo").then((response) => {
        store.commit("simpleapi/setMPVInfo", response.data);
        if (
          !response.data.mpvremoteVersion ||
          response.data.mpvremoteVersion < MINIMUM_API_VERSION
        ) {
          alert(
            `The app not gonna work properly, please update your mpv-remote-node at least to ${MINIMUM_API_VERSION}`
          );
        }
      });
      console.log("Reconnected");
      // Get status after connecting immediately.
      await apiInstance.get("/status").then((response) => {
        console.log("Got initial status");
        store.commit("simpleapi/setPlayerData", response.data);
      });

      if (store.getters["settings/androidNotificationEnabled"]) {
        console.log("Handle music controls");
        store.dispatch("simpleapi/handleMusicControls");
      }
    }
    callsPending--;
    return response;
  },
  (error) => {
    // If error has response it means we have connection to server.
    // Ignore 403 if getting drives
    callsPending--;
    if (error.message == "Network Error") {
      handleDisconnect(true);
      return Promise.reject(error);
    } else if (
      error.response &&
      error.response.config &&
      error.response.config.url.includes("drives") &&
      error.response.status == 403
    ) {
      return Promise.reject(error);
    } else if (error.response) {
      openToast(
        JSON.stringify(
          error.response.data
            ? error.response.data.message
            : error.response.message
        )
      );
      if (!store.state.simpleapi.connected) {
        store.commit("simpleapi/setConnectedState", true);
      }
    } else {
      if (store.state.simpleapi.connected) {
        handleDisconnect(true);
      }
    }
    return Promise.reject(error);
  }
);

export async function openToast(text, duration = 2000) {
  const toast = await toastController.create({
    message: text,
    duration: duration,
  });
  return toast.present();
}
