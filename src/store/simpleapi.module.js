import { apiInstance } from "../api";
const initialState = {
  playerData: {
    "audio-delay": 0, // <-- milliseconds
    "audio-devices": [],
    chapter: 0, // <-- current chapter
    chapters: 0, // <-- chapters count
    "chapter-list": [],
    duration: 0.0, // <-- seconds
    filename: null,
    fullscreen: false,
    "loop-file": false, // <-- false, true or integer
    "loop-playlist": false, // <-- false, `inf`, `force` or integer
    metadata: {},
    pause: true,
    playlist: [],
    position: -0.0, // <-- seconds
    remaining: 0.0, // <-- seconds
    speed: 1, // <-- multiplier
    "sub-delay": 0, // <-- milliseconds
    "track-list": [],
    volume: 0,
    "volume-max": 130,
  },
  playbackRefreshInterval: null,
  connected: false,
};

export const simpleapi = {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setPlayerData(state, value) {
      state.playerData = value;
    },
    setPlayerDataProperty(state, value) {
      state.playerData[value.key] = value.value;
    },
    setConnectedState(state, value) {
      state.connected = value;
    },
    clearPlaybackRefreshInterval(state) {
      if (state.playbackRefreshInterval != null) {
        console.log("Store playbackRefreshInterval should be cleared.");
        clearInterval(state.playbackRefreshInterval);
      }
    },
  },
  actions: {
    setPlaybackRefreshInterval({ commit, state }) {
      if (state.playbackRefreshInterval == null) {
        state.playbackRefreshInterval = setInterval(() => {
          apiInstance.get("/status").then((response) => {
            console.log(response.data);
            commit("setPlayerData", response.data);
          });
        }, 1500);
      }
    },
  },
};
