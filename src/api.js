import axios from "axios";
import { toastController } from "@ionic/core";
export let apiInstance = axios.create({
  timeout: 10000,
});
import { store } from "./store";

export function configureInstance(host, port) {
  apiInstance.defaults.baseURL = `http://${host}:${port}/api/v1/`;
}

apiInstance.interceptors.response.use(
  (response) => {
    if (!store.state.simpleapi.connected) {
      store.commit("simpleapi/setConnectedState", true);
    }
    return response;
  },
  (error) => {
    // If error has response it means we have connection to server.
    // Ignore 403 if getting drives
    if (error.message == "Network Error") {
      return Promise.reject(error);
    } else if (
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
        store.commit("simpleapi/setConnectedState", false);
        store.commit("simpleapi/clearPlayerData");
      }
    }
    return Promise.reject(error);
  }
);

apiInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    openToast(JSON.stringify(error));

    Promise.reject(error);
  }
);

export async function openToast(text, duration = 2000) {
  const toast = await toastController.create({
    message: text,
    duration: duration,
  });
  return toast.present();
}
