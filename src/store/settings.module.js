import { Storage } from "@capacitor/storage";

import {
  createFilemanHistorySQL,
  createServer,
  deleteServer,
  getFilemanHistorySQL,
  getServer,
  initDBTables,
  UpdateFilemanHistorySQL,
  updateServerSQL,
} from "../dbcrud";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { useSQLite } from "vue-sqlite-hook";
import { apiInstance, configureInstance } from "../api";

const initialState = {
  settings: {
    servers: [],
    currentServerId: null,
  },
  configured: false,
  sqlite: null,
  dbSession: null,
  history: [],
  filemanLastPath: null,
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
    getServerHistory: (state) => {
      return state.history;
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
    appendToServers(state, value) {
      state.settings.servers.push(value);
    },
    removeFromServers(state, value) {
      // Find server
      const index = state.settings.servers.findIndex((el) => el.id === value);
      if (index > -1) state.settings.servers.splice(index, 1);
    },
    updateServerEntry(state, value) {
      const index = state.settings.servers.findIndex(
        (el) => el.id === value.id
      );
      if (index > -1) state.settings.servers[index] = value;
    },
    setHistory(state, value) {
      state.history = value;
    },
    setFilemanLastPath(state, value) {
      state.filemanLastPath = value;
    },
  },
  actions: {
    loadSettings: async function ({ commit, state, dispatch }) {
      console.log("Load settings");

      // Migrate old local storage server handling into SQLITE based
      const oldServerIP = await Storage.get({ key: "server_ip" });
      const oldServerPort = await Storage.get({ key: "server_port" });

      if (oldServerIP.value && oldServerPort.value) {
        console.log(
          `Migrating server from older release ${oldServerIP.value} ${oldServerPort.value}`
        );
        await dispatch("addServer", {
          host: oldServerIP.value,
          port: parseInt(oldServerPort.value),
          name: "Player",
        });
        await Storage.remove({ key: "server_ip" });
        await Storage.remove({ key: "server_port" });
      }

      const servers = await getServer(state.dbSession);
      const currentServerId = await Storage.get({ key: "currentServerId" });
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
        servers,
        currentServerId: parseInt(currentServerId.value),
      });
    },
    setSetting: async function ({ commit }, payload) {
      await Storage.set({
        key: payload.key,
        value: JSON.stringify(payload.value),
      });
      commit("setSetting", payload);
    },
    setCurrentServer: async function ({ dispatch, state, commit }, serverId) {
      console.log(`Current server id ${state.settings.currentServerId}`);
      if (state.settings.currentServerId != serverId) {
        await dispatch("setSetting", {
          key: "currentServerId",
          value: serverId,
        });
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
        // Load fileman history
        await dispatch("loadFilemanHistory");
        await dispatch(
          "simpleapi/setPlaybackRefreshInterval",
          {},
          { root: true }
        );
      } else console.log("Server not found");
    },
    initSQLITE: async function ({ commit }) {
      const platform = Capacitor.getPlatform();
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      console.log("initalize sqlite");
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
        commit("setSqlite", useSQLite());
        commit("setDbSession", db);
      } catch (err) {
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
    closeDbConnection: async function ({ state, commit }) {
      console.log("Closing DB connection");
      await state.sqlite.closeConnection("remote_db");
      commit("setDbSession", null);
    },
    addServer: async function ({ state, commit, dispatch }, payload) {
      if (!state.dbSession || !state.dbSession.isDBOpen("remote_db"))
        await dispatch("initDbSession");

      const res = await createServer(state.dbSession, payload);
      payload.id = res.changes.lastId;
      commit("appendToServers", payload);

      // Set app configured state if needed and connect to server.
      if (!state.configured) {
        commit("setConfigured", true);
        await dispatch("setCurrentServer", payload.id);
      }
    },
    removeServer: async function ({ state, commit }, serverId) {
      await deleteServer(state.dbSession, serverId);
      commit("removeFromServers", serverId);
    },
    updateServer: async function ({ state, commit }, payload) {
      await updateServerSQL(state.dbSession, payload.id, payload);
      commit("updateServerEntry", payload);
    },
    loadFilemanHistory: async function ({ state, commit }) {
      const history = await getFilemanHistorySQL(
        state.dbSession,
        state.settings.currentServerId
      );
      if (history.length > 0) {
        console.log(
          `History found for server: paths: ${
            history[0].paths
          } ${JSON.stringify(history[0].last_path)}`
        );
        commit("setHistory", JSON.parse(history[0].paths));
        commit("setFilemanLastPath", JSON.parse(history[0].last_path));
      } else {
        console.log("Creating fileman hitory");
        await createFilemanHistorySQL(
          state.dbSession,
          state.settings.currentServerId,
          []
        );
      }
    },
    updateFilemanHistory: async function ({ state, commit }, payload) {
      await UpdateFilemanHistorySQL(
        state.dbSession,
        state.settings.currentServerId,
        payload.paths,
        payload.last_path
      );
      commit("setHistory", payload.paths);
      commit("setFilemanLastPath", payload.last_path);
    },
  },
};
