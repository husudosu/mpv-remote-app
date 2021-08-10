// import store from "../store";
import SocketIO from "socket.io-client";
import { handle_socket } from "../socketClient";

const initialState = {
  connected: false,
  playerData: {
    playback_time: "00:00:00",
    pause: true,
    percent_pos: 0,
    volume: null,
    fullscreen: null,
    mute: null,
    filename: null,
    duration: "00:00:00",
    media_title: null,
    playlist: [],
  },
  socket: null,
  playbackRefreshInterval: null,
};

export const mpvsocket = {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setConnectState(state, value) {
      state.connected = value;
    },
    setPlayerData(state, value) {
      state.playerData = value;
    },
    setPlayback(state, value) {
      state.playerData.playback_time = value.playback_time;
      if (value.percent_pos) {
        state.playerData.percent_pos = value.percent_pos;
      }
    },
    setPause(state, value) {
      // If paused remove playback update.
      state.playerData.pause = value;
    },
    // On EOF or Playback stopped
    resetPlayback(state) {
      state.playerData.filename = null;
      state.playerData.duration = "00:00:00";
      state.playerData.playback_time = "00:00:00";
      state.playerData.percent_pos = 0;
      state.playerData.media_title = null;
    },
    setProp(state, value) {
      console.log(
        `Property changed: ${value.property}: ${JSON.stringify(value.value)}`
      );
      state.playerData[value.property] = value.value;
    },
    setSocket(state, value) {
      state.socket = value;
    },
    setPlaybackRefreshInterval(state) {
      if (state.playbackRefreshInterval == null) {
        state.playbackRefreshInterval = setInterval(() => {
          if (state.socket.connected) state.socket.emit("playbackTime");
          else console.log("Socket not connected");
        }, 1500);
      }
    },
    clearPlaybackRefreshInterval(state) {
      if (state.playbackRefreshInterval != null) {
        console.log("Store playbackRefreshInterval should be cleared.");
        clearInterval(state.playbackRefreshInterval);
      }

      state.playbackRefreshInterval = null;
    },
  },
  actions: {
    setupSocket({ commit, rootState }) {
      console.log("Setting up Socket IO client.");
      const server_ip = rootState.settings.settings.server.server_ip;
      const server_port = rootState.settings.settings.server.server_port;
      if (server_ip != null && server_port != null) {
        const socket = SocketIO(`http://${server_ip}:${server_port}`, {
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionDelayMax: 1000,
          timeout: 1200,
          upgrade: false,
        });
        commit("setSocket", socket);
        handle_socket();
        console.log("Socket IO client setup complete");
      } else {
        console.log("Server ip or server port missing!");
      }
    },
    async clearSocket({ commit, state }) {
      if (state.socket) await state.socket.disconnect();
      commit("setSocket", null);
    },
  },
};
