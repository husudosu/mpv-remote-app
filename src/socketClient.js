import SocketIO from "socket.io-client";
import { store } from "./store";

// import { toastController } from "@ionic/vue";
export let socket = null;

export let playbackRefreshInterval = null;

// TODO: Handle connection failure.
export async function connect() {
  await store.dispatch("settings/loadSettings");

  let server_ip = store.state.settings.settings.server.server_ip;
  let server_port = store.state.settings.settings.server.server_port;
  console.log(`Gonna connect to: ${server_ip}:${server_port}`);

  if (socket && socket.connected === true) await disconnect();
  if (!server_port) server_port = 8000;
  if (server_ip) {
    console.log(`Connecting to: ${server_ip}:${server_port}`);
    socket = SocketIO(`http://${server_ip}:${server_port}`, {
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 1500,
    });
    handle_socket();
  }
}

export async function disconnect() {
  /* 
    TODO: Only disconnect when settings gonna change
    clearInterval should be called if the view != player
    */
  if (playbackRefreshInterval) clearPlaybackRefreshInterval();
  if (socket) {
    console.log("Socket disconnect");
    socket.disconnect();
    socket = null;
  }
}

// async function showToast(message, duration = 1500) {
//   const toast = await toastController.create({
//     message,
//     duration,
//   });
//   return toast.present();
// }

function refreshPlaybackInterval() {
  socket.emit("playbackTime");
}

function clearPlaybackRefreshInterval() {
  clearInterval(playbackRefreshInterval);
  playbackRefreshInterval = null;
}

function handle_socket() {
  socket.on("connect", () => {
    store.commit("mpvsocket/setConnectState", true);
    console.log("Connected to server");
    // showToast("Connected to server");
  });

  socket.on("disconnect", () => {
    store.commit("mpvsocket/setConnectState", false);
    if (playbackRefreshInterval) clearPlaybackRefreshInterval();
    console.log("User disconnect");
    // showToast("Disconnected from server");
  });

  socket.on("pause", (data) => {
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
  socket.on("playerData", (data) => {
    store.commit("mpvsocket/setPlayerData", data);
    // Start checking
    if (!data.pause && data.filename && !playbackRefreshInterval) {
      playbackRefreshInterval = setInterval(() => {
        refreshPlaybackInterval();
      }, 1500);
    }
    console.log(data);
  });

  socket.on("propChange", (data) => {
    console.log(`Property changed: ${JSON.stringify(data)}`);
    store.commit("mpvsocket/setProp", data);
  });

  // End of file or stopped
  socket.on("stopped", () => {
    console.log("End of file reached");
    if (playbackRefreshInterval) clearPlaybackRefreshInterval();
    store.commit("mpvsocket/resetPlayback");
  });

  socket.on("playbackTimeResponse", (data) => {
    console.log(data);
    store.commit("mpvsocket/setPlayback", data);
  });
}
