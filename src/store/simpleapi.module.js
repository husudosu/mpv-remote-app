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
    mpvremoteVersion: "0.0.0.0",
  },
  musicControlsActive: false,
  musicControlStatus: {
    artist: "",
  },
};

const musicControlsSettings = {
  hasPrev: false,
  hasNext: false,
  cover: null,
};

const musicEventHandler = async (action) => {
  const message = JSON.parse(action).message;
  console.log(`Message from controller: ${message}`);
  switch (message) {
    case "music-controls-pause":
      await apiInstance
        .post("/controls/play-pause")
        .then(() => musicControls.updateIsPlaying(false));
      break;
    case "music-controls-play":
      await apiInstance
        .post("/controls/play-pause")
        .then(() => musicControls.updateIsPlaying(true));
      break;
  }
};
export const simpleapi = {
  namespaced: true,
  state: { ...initialState },
  getters: {
    connectionState: (state) => state.connected,
    playerData: (state) => state.playerData,
    playerTitle: (state) => {
      if (state.connected) {
        return (
          state.playerData["media-title"] ||
          state.playerData.filename ||
          "Connected (No playback)"
        );
      } else {
        return "Disconnected";
      }
    },
    fileBrowserEnabled: (state) => {
      return (
        state.MPVInfo.mpvremoteConfig.unsafefilebrowsing ||
        state.MPVInfo.mpvremoteConfig.uselocaldb
      );
    },
    audioTracks: (state) => {
      return state.playerData["track-list"].filter(
        (track) => track.type === "audio"
      );
    },
    selectedAudioTrackId: (state) => {
      return state.playerData["track-list"].find(
        (track) => track.type === "audio" && track.selected
      ).id;
    },
  },
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
      console.log("clear playback refresh interval");
      if (state.playbackRefreshInterval != null) {
        clearInterval(state.playbackRefreshInterval);
        state.playbackRefreshInterval = null;
      }
    },
    clearPlayerData(state) {
      state.playerData = { ...initialState.playerData };
    },
    setMusicControlsActive(state, value) {
      state.musicControlsActive = value;
    },
    setMusicControlsTitle(state, value) {
      state.musicControlStatus.artist = value;
    },
  },
  actions: {
    setPlaybackRefreshInterval({ commit, state, dispatch, rootGetters }) {
      if (state.playbackRefreshInterval == null) {
        state.playbackRefreshInterval = setInterval(() => {
          apiInstance.get("/status").then((response) => {
            commit("setPlayerData", response.data);
            if (rootGetters["settings/androidNotificationEnabled"] === true) {
              dispatch("handleMusicControls");
            }
          });
        }, 1500);
      }
    },
    handleMusicControls({ commit, state }) {
      if (state.playerData.filename) {
        const title =
          state.playerData["media-title"] || state.playerData.filename;

        if (title != state.musicControlStatus.artist) {
          console.log("Have to change title");

          if (state.musicControlsActive) {
            musicControls.destroy();
            musicControls.create({ ...musicControlsSettings, track: title });
            musicControls.subscribe(musicEventHandler);
            musicControls.listen();
          } else {
            musicControls.create({ ...musicControlsSettings, track: title });
            musicControls.subscribe(musicEventHandler);
            musicControls.listen();
          }
          commit("setMusicControlsTitle", title);
          commit("setMusicControlsActive", true);
          musicControls.updateIsPlaying(!state.playerData.pause);
        } else {
          musicControls.updateIsPlaying(!state.playerData.pause);
        }
      } else if (state.musicControlsActive) {
        console.log("Music controls should be destroyed");
        musicControls.destroy();
        commit("setMusicControlsActive", false);
      }
    },
  },
};
