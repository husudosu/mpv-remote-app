import axios from "axios";
import { store } from "./store";

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
  store.dispatch("app/showToast", { message: JSON.stringify(error) });
  Promise.reject(error);
}

// FIXME: App still creates musicController when it's disabled on settings.
function handleDisconnect(auto_reconnect = false) {
  if (!auto_reconnect) {
    store.commit("simpleapi/clearPlaybackRefreshInterval");
    store.commit("simpleapi/clearPlaylistRefreshInterval");
  }
  store.commit("simpleapi/setConnectedState", false);
  store.commit("simpleapi/clearPlayerData");
}

export function disconnect() {
  handleDisconnect();

  if (callsPending > 0) {
    callsPending = 0;
    cancelSource.cancel("Cancel pending requests");
    cancelSource = axios.CancelToken.source();
  }
}

export async function configureInstance(host, port) {
  // Before reconfiguration set store states.
  disconnect();
  apiInstance.defaults.baseURL = `http://${host}:${port}/api/v1/`;
  apiInstance.interceptors.request.use(requestOnFulfilled, requestOnRejected);

  await apiInstance.get("mpvinfo").then((response) => {
    store.commit("simpleapi/setMPVInfo", response.data);
    // Change connected state to True
    store.commit("simpleapi/setConnectedState", true);
    if (
      !response.data.mpvremoteVersion ||
      response.data.mpvremoteVersion < MINIMUM_API_VERSION
    ) {
      alert(
        `The app not gonna work properly, please update your mpv-remote-node at least to ${MINIMUM_API_VERSION}`
      );
    }
  });

  // Get status after configuring
  await apiInstance
    .get("/status", { params: { exclude: "playlist" } })
    .then((response) => {
      console.log("Got initial status");
      store.commit("simpleapi/setPlayerData", response.data);
    });
  // Handle music controls if needed
  if (store.getters["settings/androidNotificationEnabled"]) {
    console.log("Handle music controls");
    store.dispatch("simpleapi/handleMusicControls");
  }
}

apiInstance.interceptors.response.use(
  async (response) => {
    if (!store.state.simpleapi.connected) {
      store.commit("simpleapi/setConnectedState", true);
      // Check mpv-remote-node version
      await apiInstance.get("mpvinfo").then((response) => {
        store.commit("simpleapi/setMPVInfo", response.data);
        // Change connected state to True
        store.commit("simpleapi/setConnectedState", true);
        if (
          !response.data.mpvremoteVersion ||
          response.data.mpvremoteVersion < MINIMUM_API_VERSION
        ) {
          alert(
            `The app not gonna work properly, please update your mpv-remote-node at least to ${MINIMUM_API_VERSION}`
          );
        }
      });
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
      store.dispatch("app/showToast", {
        message: JSON.stringify(
          error.response.data
            ? error.response.data.message
            : error.response.message
        ),
      });
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
