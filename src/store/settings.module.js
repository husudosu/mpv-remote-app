import { Storage } from "@capacitor/storage";

import { createServer, getServer, initDBTables } from "../dbcrud";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { useSQLite } from "vue-sqlite-hook";
import { apiInstance, configureInstance } from "../api";

const initialState = {
  settings: {
    filemanLastPath: null,
    servers: [],
    history: [], // TODO: Should be deprecated
    currentServerId: null,
  },
  configured: false,
  sqlite: null,
  dbSession: null,
  /*
  New history model should be: 
  [
    {
      server_id: 1,
      paths: "paths"
    }
  ]
  */
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
      return state.settings.currentServerId;
    },
    configured: (state) => {
      return state.configured;
    },
    dbSession: (state) => {
      return state.dbSession;
    },
  },
  mutations: {
    setAppSettings(state, value) {
      state.settings = value;
    },
    setSqlite(state, value) {
      state.sqlite = value;
    },
    setDbSession(state, value) {
      state.dbSession = value;
    },
    setSetting(state, value) {
      state.settings[value.key] = value.value;
    },
    setConfigured(state, value) {
      state.configured = value;
    },
    setHistory(state, value) {
      // find server
      // SQL Should be used TOOD
      state.history = value;
    },
    appendToHistory(state, value) {
      state.history.push(value);
    },
    appendToServers(state, value) {
      state.settings.servers.push(value);
    },
  },
  actions: {
    loadSettings: async function ({ commit, state }) {
      console.log("Load settings");
      const sqlite = state.sqlite;
      const db = await sqlite.createConnection("remote_db");
      await db.open();
      const servers = await getServer(db);

      const filemanLastPath = await Storage.get({ key: "filemanLastPath" });
      const history = await Storage.get({ key: "history" });
      const currentServerId = await Storage.get({ key: "currentServerId" });
      console.log("Current server ID:");
      console.log(currentServerId.value);
      if (servers.length > 0) {
        if (!currentServerId.value) {
          await Storage.set({
            key: "currentServerId",
            value: servers[0].id,
          });
          currentServerId.value = servers[0].id.toString();
        }
        commit("setConfigured", true);
      } else commit("setConfigured", false);

      commit("setAppSettings", {
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
        value: JSON.stringify(payload.value),
      });
      commit("setSetting", payload);
    },
    setCurrentServer: async function ({ dispatch, state, commit }, serverId) {
      if (state.settings.currentServerId != serverId) {
        await dispatch("setSetting", {
          key: "currentServerId",
          value: serverId,
        });
        console.log(`Change current server to: ${serverId}`);
      }
      // Find server data
      const server = state.settings.servers.find((el) => el.id === serverId);
      if (server) {
        console.log(`Connecting to server: ${server.host}:${server.port}`);
        // Clear stuff if there is an existing connection.
        await commit(
          "simpleapi/clearPlaybackRefreshInterval",
          {},
          { root: true }
        );
        configureInstance(server.host, server.port);

        // Get status after connecting immediately.
        apiInstance.get("/status").then((response) => {
          commit("simpleapi/setPlayerData", response.data, { root: true });
        });
        await dispatch(
          "simpleapi/setPlaybackRefreshInterval",
          {},
          { root: true }
        );
      } else console.log("Server not found");
    },
    cleanFilemanHistory: async function ({ dispatch }) {
      await Storage.remove({ key: "history" });
      await Storage.remove({ key: "filemanLastPath" });
      await dispatch("loadSettings");
    },
    initSQLITE: async function ({ commit }) {
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
    initDbSession: async function ({ state, commit }) {
      // Session not exists or session closed
      console.log("Create db session");
      const db = await state.sqlite.createConnection("remote_db");
      await db.open();
      commit("setDbSession", db);
    },
    addServer: async function ({ state, commit, dispatch }, payload) {
      if (!state.dbSession || !state.dbSession.isDBOpen("remote_db"))
        await dispatch("initDbSession");

      createServer(state.dbSession, payload);
      // TODO: Use server ID here!
      commit("appendToServers", payload);
    },
  },
};
