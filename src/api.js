import axios from "axios";
import { toastController } from "@ionic/core";
export let apiInstance = axios.create({
  timeout: 10000,
});
import { store } from "./store";

export function configureInstance(host, port) {
  apiInstance.defaults.baseURL = `http://${host}:${port}/api/`;
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
    if (error.response) {
      if (error.response.status != 503)
        openToast(
          JSON.stringify(
            error.response.data ? error.response.data : error.response.message
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
