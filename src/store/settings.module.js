import { Storage } from "@capacitor/storage";

import { getServer, initDBTables } from "../dbcrud";
// import { useState } from "@/composables/state";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { useSQLite } from "vue-sqlite-hook";

const initialState = {
  settings: {
    configured: false,
    filemanLastPath: null,
    servers: [],
    history: [], // TODO: Should be deprecated
    currentServerId: null,
  },
  sqlite: null,
  history: [],
};

export const settings = {
  namespaced: true,
  state: { ...initialState },
  getters: {
    servers: (state) => {
      return state.settings.servers;
    },
    currentServerId: (state) => {
      return state.settings.servers.currentServerId;
    },
  },
  mutations: {
    setAppSettings(state, value) {
      state.settings = value;
    },
    setSqlite(state, value) {
      state.sqlite = value;
    },
    setSetting(state, value) {
      state.settings[value.key] = value.value;
    },
  },
  actions: {
    loadSettings: async function ({ commit, state, dispatch }) {
      console.log("Load settings");
      if (!state.sqlite) {
        console.log("Have to initalize SQLITE into Vuex");
        await await dispatch("initDatabaseConn");
      }
      const sqlite = state.sqlite;
      const db = await sqlite.createConnection("remote_db");
      await db.open();
      const servers = await getServer(db);

      const filemanLastPath = await Storage.get({ key: "filemanLastPath" });
      const history = await Storage.get({ key: "history" });
      const currentServerId = await Storage.get({ key: "currentServerId" });

      let configured = false;
      if (servers.length > 0) {
        await Storage.set({
          key: "currentServerId",
          value: servers[0].id,
        });
        configured = true;
      }

      commit("setAppSettings", {
        configured,
        filemanLastPath: JSON.parse(filemanLastPath.value),
        history: JSON.parse(history.value),
        servers,
        currentServerId: parseInt(currentServerId.value),
      });
      await sqlite.closeConnection("remote_db");
    },
    setSetting: async function ({ commit }, payload) {
      await Storage.set({
        key: payload.key,
        value: payload.value,
      });
      commit("setSetting", payload);
    },
    cleanFilemanHistory: async function ({ dispatch }) {
      await Storage.remove({ key: "history" });
      await Storage.remove({ key: "filemanLastPath" });
      await dispatch("loadSettings");
    },
    initDatabaseConn: async function ({ commit }) {
      const platform = Capacitor.getPlatform();
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      console.log("initalize sqlite");
      // const [existConn, setExistConn] = useState(false);
      // app.config.globalProperties.$existingConn = {
      //   existConn: existConn,
      //   setExistConn: setExistConn,
      // };

      try {
        if (platform === "web") {
          // Create the 'jeep-sqlite' Stencil component
          const jeepSqlite = document.createElement("jeep-sqlite");
          document.body.appendChild(jeepSqlite);
          await customElements.whenDefined("jeep-sqlite");
          // Initialize the Web store
          await sqlite.initWebStore();
        }

        // example: database creation with standard SQLite statements
        const ret = await sqlite.checkConnectionsConsistency();
        const isConn = (await sqlite.isConnection("remote_db")).result;
        let db;
        if (ret.result && isConn) {
          db = await sqlite.retrieveConnection("remote_db");
        } else {
          db = await sqlite.createConnection(
            "remote_db",
            false,
            "no-encryption",
            1
          );
        }
        await db.open();
        await initDBTables(db);
        await sqlite.closeConnection("remote_db");
        commit("setSqlite", useSQLite());
      } catch (err) {
        console.log(`Error: ${err}`);
        throw new Error(`Error: ${err}`);
      }
    },
  },
};
