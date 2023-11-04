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
  playlist: [],
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
    pause: true,
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
    setPlaylist(state, value) {
      state.playlist = value;
    },
    clearPlaylistRefreshInterval(state) {
      console.log("clear playlist refresh interval");
      if (state.playlistRefreshInterval != null) {
        clearInterval(state.playlistRefreshInterval);
        state.playlistRefreshInterval = null;
      }
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
      if (!value) state.musicControlStatus.artist = "";
    },
    setMusicControlsTitle(state, value) {
      state.musicControlStatus.artist = value;
    },
    setMusicControlsPuasedState(state, value) {
      state.musicControlStatus.pause = value;
    },
  },
  actions: {
    setPlaylistRefreshInterval({ commit, state }) {
      console.log("Set playlist interval");
      if (state.playlistRefreshInterval == null) {
        state.playlistRefreshInterval = setInterval(() => {
          apiInstance.get("/playlist").then((response) => {
            commit("setPlaylist", response.data);
          });
        }, 1500);
      }
    },
    setPlaybackRefreshInterval({ commit, state, dispatch, rootGetters }) {
      if (state.playbackRefreshInterval == null) {
        state.playbackRefreshInterval = setInterval(() => {
          // We get status data excluding playlist data.
          apiInstance
            .get("/status", { params: { exclude: "playlist" } })
            .then((response) => {
              commit("setPlayerData", response.data);
              if (rootGetters["settings/androidNotificationEnabled"] == true) {
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
          if (state.musicControlsActive) {
            musicControls.destroy();
            musicControls.create({ ...musicControlsSettings, track: title });
            musicControls.subscribe(musicEventHandler);
            musicControls.listen();
            musicControls.updateIsPlaying(!state.playerData.pause);
          } else {
            musicControls.create({ ...musicControlsSettings, track: title });
            musicControls.subscribe(musicEventHandler);
            musicControls.listen();
            musicControls.updateIsPlaying(!state.playerData.pause);
          }
          commit("setMusicControlsTitle", title);
          commit("setMusicControlsActive", true);
          /* Update isPlaying on some phones keeps sending notification to phone when it's on sleep.
           So we have handle that by only updating when the the playback paused/unpaused*/
          if (state.musicControlStatus.pause != state.playerData.pause) {
            musicControls.updateIsPlaying(!state.playerData.pause);
            commit("setMusicControlsPuasedState", state.playerData.pause);
          }
        } else {
          if (state.musicControlStatus.pause != state.playerData.pause) {
            musicControls.updateIsPlaying(!state.playerData.pause);
            commit("setMusicControlsPuasedState", state.playerData.pause);
          }
        }
      } else if (state.musicControlsActive) {
        console.log("Music controls should be destroyed");
        musicControls.destroy();
        commit("setMusicControlsActive", false);
      }
    },
  },
};
