import { store } from "./store";

// import { toastController } from "@ionic/vue";

export let playbackRefreshInterval = null;

// async function showToast(message, duration = 1500) {
//   const toast = await toastController.create({
//     message,
//     duration,
//   });
//   return toast.present();
// }

function refreshPlaybackInterval() {
  store.state.mpvsocket.socket.emit("playbackTime");
}

function clearPlaybackRefreshInterval() {
  clearInterval(playbackRefreshInterval);
  playbackRefreshInterval = null;
}

export async function handle_socket() {
  store.state.mpvsocket.socket.on("connect", () => {
    store.commit("mpvsocket/setConnectState", true);
    console.log("Connected to server");
    // showToast("Connected to server");
  });

  store.state.mpvsocket.socket.on("disconnect", async () => {
    store.commit("mpvsocket/setConnectState", false);
    if (playbackRefreshInterval) clearPlaybackRefreshInterval();
    console.log("User disconnect");
    // showToast("Disconnected from server");
  });

  store.state.mpvsocket.socket.on("pause", (data) => {
    console.log(`Paused trigger from server ${data}`);
    store.commit("mpvsocket/setPause", data);

    // Playback paused
    if (data === true) {
      console.log("Clearing interval");
      if (playbackRefreshInterval) clearPlaybackRefreshInterval();
    }
    // Start play again
    else {
      console.log("Playing again");
      console.log(playbackRefreshInterval);
      if (!playbackRefreshInterval) {
        playbackRefreshInterval = setInterval(
          () => refreshPlaybackInterval(),
          1500
        );
      }
    }
  });

  // On new file opened
  store.state.mpvsocket.socket.on("playerData", (data) => {
    store.commit("mpvsocket/setPlayerData", data);
    // Start checking
    if (!data.pause && data.filename && !playbackRefreshInterval) {
      playbackRefreshInterval = setInterval(() => {
        refreshPlaybackInterval();
      }, 1500);
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
    if (playbackRefreshInterval) clearPlaybackRefreshInterval();
    store.commit("mpvsocket/resetPlayback");
  });

  store.state.mpvsocket.socket.on("playbackTimeResponse", (data) => {
    console.log(data);
    store.commit("mpvsocket/setPlayback", data);
  });
}
