import axios from "axios";
import { toastController } from "@ionic/core";
export let apiInstance = axios.create({
  timeout: 10000,
});

export function configureInstance(host, port) {
  apiInstance.defaults.baseURL = `http://${host}:${port}`;
}

apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    openToast(JSON.stringify(error.message));
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
