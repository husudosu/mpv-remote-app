import { apiInstance } from "../api";
const initialState = {
  playerData: {
    "audio-delay": 0, // <-- milliseconds
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
    "track-list": [
      {
        id: null,
      },
    ],
    volume: 0,
    "volume-max": 100,
  },
  playbackRefreshInterval: null,
  connected: false,
  MPVInfo: {
    "ffmpeg-version": "N/A",
    "mpv-version": "N/A",
    "libass-version": "N/A",
    mpvremoteConfig: {
      unsafefilebrowsing: false,
      uselocaldb: false,
    },
  },
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
    setMPVInfo(state, value) {
      state.MPVInfo = value;
    },
    clearPlaybackRefreshInterval(state) {
      if (state.playbackRefreshInterval != null) {
        console.log("Store playbackRefreshInterval should be cleared.");
        clearInterval(state.playbackRefreshInterval);
        state.playbackRefreshInterval = null;
      }
    },
    clearPlayerData(state) {
      state.playerData = { ...initialState.playerData };
    },
  },
  actions: {
    setPlaybackRefreshInterval({ commit, state }) {
      if (state.playbackRefreshInterval == null) {
        state.playbackRefreshInterval = setInterval(() => {
          apiInstance.get("/status").then((response) => {
            commit("setPlayerData", response.data);
          });
        }, 1500);
      }
      // Also setup local notifcations
    },
  },
};
