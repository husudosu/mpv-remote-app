import { apiInstance } from "../api";
import musicControls from "cordova-plugin-music-controls2/www/MusicControls.js";
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
    "media-title": null,
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
  musicControlsActive: false,
  musicControlStatus: {
    artist: "",
    isPlaying: false,
    filename: "",
    "media-title": "",
  },
};

function events(action) {
  const message = JSON.parse(action).message;
  switch (message) {
    case "music-controls-next":
      apiInstance.post("controls/next");
      break;
    case "music-controls-previous":
      apiInstance.post("controls/prev");
      break;
    case "music-controls-pause":
      // Do something
      console.log("MusicController: Pause");
      musicControls.updateIsPlaying(false);
      apiInstance.post("/controls/play-pause");
      break;
    case "music-controls-play":
      // Do something
      console.log("MusicController: Play");
      apiInstance.post("/controls/play-pause");
      musicControls.updateIsPlaying(true);
      break;
    case "music-controls-destroy":
      // Do something
      console.log("Destroy music controls");
      break;
    default:
      break;
  }
}

export const simpleapi = {
  namespaced: true,
  state: { ...initialState },
  mutations: {
    setPlayerData(state, value) {
      state.playerData = value;

      // If music controls enabled
      if (state.connected && state.playerData.filename) {
        if (!state.musicControlsActive) {
          musicControls.create(
            {
              artist:
                state.playerData["media-title"] || state.playerData.filename,
              dismissable: false,
            },
            () => {
              state.musicControlsActive = true;
            }
          );
          state.musicControlStatus["media-title"] =
            state.playerData["media-title"];
          state.musicControlStatus.filename = state.playerData.filename;

          musicControls.updateIsPlaying(!state.playerData.pause);
          musicControls.subscribe(events);
          musicControls.listen();
        } else {
          // Media have changed.
          if (
            state.musicControlStatus["media-title"] !=
              state.playerData["media-title"] ||
            state.musicControlStatus.filename != state.playerData.filename
          ) {
            musicControls.destroy();
            state.musicControlsActive = false;
          } else {
            musicControls.updateIsPlaying(!state.playerData.pause);
          }
        }
      }
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
