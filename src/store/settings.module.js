import { Storage } from "@capacitor/storage";

const initialState = {
  settings: {
    server: {
      server_ip: null,
      server_port: 8000,
    },
    configured: false,
  },
};

export const settings = {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setAppSettings(state, value) {
      state.settings = value;
    },
  },
  actions: {
    loadSettings: async function ({ commit }) {
      const server_ip = await Storage.get({ key: "server_ip" });
      const server_port = await Storage.get({ key: "server_port" });
      let configured = false;

      console.log(`Config variables: ${server_ip.value} ${server_port.value}`);

      if (server_ip.value && server_port.value) configured = true;

      commit("setAppSettings", {
        server: {
          server_ip: server_ip.value,
          server_port: server_port.value,
        },
        configured,
      });
    },
    setSetting: async function ({ dispatch }, payload) {
      await Storage.set({
        key: payload.key,
        value: payload.value,
      });
      await dispatch("loadSettings");
    },
  },
};
