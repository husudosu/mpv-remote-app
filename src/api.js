import axios from "axios";

export let apiInstance = axios.create({
  timeout: 10000,
});

export function configureInstance(host, port) {
  apiInstance.defaults.baseURL = `http://${host}:${port}`;
}
