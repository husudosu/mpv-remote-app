import { apiInstance } from "../api";
const initialState = {
  playerData: {
    "audio-delay": 0, // <-- milliseconds
    "audio-devices": [
      { active: true, description: "Autoselect device", name: "auto" },
      { active: false, description: "Default (alsa)", name: "alsa" },
      { active: false, description: "Default (jack)", name: "jack" },
      { active: false, description: "Default (sdl)", name: "sdl" },
      { active: false, description: "Default (sndio)", name: "sndio" },
    ],
    chapter: 0, // <-- current chapter
    chapters: 0, // <-- chapters count
    "chapter-list": [
      // Array length == "chapters".
      {
        title: "Chapter 0",
        time: 0, // <-- start time in seconds
      },
    ],
    duration: 6.024, // <-- seconds
    filename: "01 - dummy.mp3",
    fullscreen: false,
    "loop-file": false, // <-- false, true or integer
    "loop-playlist": false, // <-- false, `inf`, `force` or integer
    metadata: {
      // <-- all metadata available to MPV
      album: "Dummy Album",
      artist: "Dummy Artist",
      comment: "0",
      date: "2020",
      encoder: "Lavc57.10",
      genre: "Jazz",
      title: "First dummy",
    },
    pause: true,
    playlist: [
      {
        current: true,
        filename: "./environment/test_media/01 - dummy.mp3",
        playing: true,
      },
      { filename: "./environment/test_media/02 - dummy.mp3" },
      { filename: "./environment/test_media/03 - dummy.mp3" },
    ],
    position: -0.0, // <-- seconds
    remaining: 6.024, // <-- seconds
    speed: 1, // <-- multiplier
    "sub-delay": 0, // <-- milliseconds
    "track-list": [
      // <-- all available video, audio and sub tracks
      {
        albumart: false,
        "audio-channels": 2,
        codec: "mp3",
        "decoder-desc": "mp3float (MP3 (MPEG audio layer 3))",
        default: false,
        "demux-channel-count": 2,
        "demux-channels": "stereo",
        "demux-samplerate": 48000,
        dependent: false,
        external: false,
        "ff-index": 0,
        forced: false,
        id: 1,
        selected: true,
        "src-id": 0,
        type: "audio",
      },
    ],
    volume: 0,
    "volume-max": 130,
  },
  playbackRefreshInterval: null,
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
            commit("setPlayerData", response.data);
            console.log(response.data);
          });
        }, 1500);
      }
    },
  },
};
