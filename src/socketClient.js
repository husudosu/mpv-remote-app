import { store } from "./store";

export async function handle_socket() {
  store.state.mpvsocket.socket.on("connect", () => {
    store.commit("mpvsocket/setConnectState", true);
    console.log("Connected to server");
    // showToast("Connected to server");
  });

  store.state.mpvsocket.socket.on("disconnect", async () => {
    store.commit("mpvsocket/setConnectState", false);
    store.commit("mpvsocket/clearPlaybackRefreshInterval");
    console.log("User disconnect");
    // showToast("Disconnected from server");
  });

  store.state.mpvsocket.socket.on("pause", (data) => {
    console.log(`Paused trigger from server ${data}`);
    store.commit("mpvsocket/setPause", data);

    // Playback paused
    if (data === true) {
      console.log("Clearing interval");
      store.commit("mpvsocket/clearPlaybackRefreshInterval");
    }
    // Start play again
    else {
      console.log("Playing again");
      store.commit("mpvsocket/setPlaybackRefreshInterval");
    }
  });

  // On new file opened
  store.state.mpvsocket.socket.on("playerData", (data) => {
    store.commit("mpvsocket/setPlayerData", data);
    // Start checking
    if (!data.pause && data.filename) {
      store.commit("mpvsocket/setPlaybackRefreshInterval");
    }
    console.log(data);
  });

  store.state.mpvsocket.socket.on("propChange", (data) => {
    console.log(`Property changed: ${JSON.stringify(data)}`);
    store.commit("mpvsocket/setProp", data);
  });

  // End of file or stopped
  store.state.mpvsocket.socket.on("stopped", () => {
    console.log("End of file reached");
    store.commit("mpvsocket/clearPlaybackRefreshInterval");
    store.commit("mpvsocket/resetPlayback");
  });

  store.state.mpvsocket.socket.on("playbackTimeResponse", (data) => {
    console.log(data);
    store.commit("mpvsocket/setPlayback", data);
  });
}
