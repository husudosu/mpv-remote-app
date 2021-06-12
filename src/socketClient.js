import SocketIO from "socket.io-client";
import {store} from './store' ;

import {toastController} from '@ionic/vue';
export let socket = null;

export let playbackRefreshInterval = null;

export async function connect(){
    await store.dispatch("settings/loadSettings");
    
    let server_ip = store.state.settings.server.server_ip.value;
    let server_port = store.state.settings.server.server_port.value;
    if (!server_port) server_port = 8000;
    if (server_ip){
        console.log(`Connecting to: ${server_ip}:${server_port}`);
        socket = SocketIO(`http://${server_ip}:${server_port}`);
        handle_socket();
    }
}

export async function disconnect(){
    /* 
    TODO: Only disconnect when settings gonna change
    clearInterval should be called if the view != player
    */
    if (socket){
        if (playbackRefreshInterval) clearInterval(playbackRefreshInterval);
        console.log("Socket disconnect");
        socket.disconnect();
        
    }
}

async function showToast(message, duration=1500){
    const toast = await toastController
        .create({
            message,
            duration,
        })
    return toast.present()
}

function refreshPlaybackInterval(){
    socket.emit("playbackTime");
}

function handle_socket(){
    socket.on("connect", () => {
        store.commit("mpvsocket/setConnectState", true);
        console.log("Connected to server");
        showToast("Connected to server")
    });

    socket.on("disconnect", () => {
        store.commit("mpvsocket/setConnectState", false);
        if (playbackRefreshInterval) clearInterval(playbackRefreshInterval);
        console.log("User disconnect");
        showToast("Disconnected from server");
    });

    socket.on("pause", (data) => {
        console.log(`Paused trigger from server ${data}`);
        store.commit("mpvsocket/setPause", data);
        
        // Playback paused
        if (data === true){
            if (playbackRefreshInterval) clearInterval(playbackRefreshInterval);
        }
        // Start play again
        else {
            playbackRefreshInterval = setInterval(() => refreshPlaybackInterval(), 1500);
        }
    });

    // On new file opened
    socket.on("playerData", (data) => {
        store.commit("mpvsocket/setPlayerData", data);
        // Start checking
        if (!data.pause && data.filename && !playbackRefreshInterval){
            playbackRefreshInterval = setInterval(() => {refreshPlaybackInterval()}, 1500);
        }
        console.log(data); 
    });

    socket.on('propChange', (data) => {
        console.log(`Property changed: ${JSON.stringify(data)}`);
        store.commit("mpvsocket/setProp", data);
    })

    // End of file or stopped
    socket.on('stopped', () => {
        console.log("End of file reached");
        if (playbackRefreshInterval) clearInterval(playbackRefreshInterval);
        store.commit('mpvsocket/resetPlayback');
    });

    socket.on("playbackTimeResponse", (data) => {
        console.log(data);
        store.commit("mpvsocket/setPlayback", data);
    });
}