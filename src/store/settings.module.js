import { Storage } from "@capacitor/storage";

const initialState = {
  settings: {
    server: {
      server_ip: null,
      server_port: 8000,
    },
    configured: false,
    filemanLastPath: null,
    history: [],
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
      const filemanLastPath = await Storage.get({ key: "filemanLastPath" });
      const history = await Storage.get({ key: "history" });

      let configured = false;

      // Set default value for server_port
      if (!server_port.value)
        await Storage.set({ key: "server_port", value: 8000 });
      if (server_ip.value && server_port.value) configured = true;

      commit("setAppSettings", {
        server: {
          server_ip: server_ip.value,
          server_port: server_port.value,
        },
        configured,
        filemanLastPath: JSON.parse(filemanLastPath.value),
        history: JSON.parse(history.value),
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
