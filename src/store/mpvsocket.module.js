

const initialState = {
    connected: false,
    playerData: {
        "playback": null,
        "pause": true,
        "time": null,
        "pos": null,
        "volume": null,
        "subtitles": null,
        "audio": null,
        "fullscreen": null,
        "mute": null,
        "subtitle_tracks": [],
        "audio_tracks": [],
    }
}

export const mpvsocket = {
    namespaced: true, 
    state: {...initialState},
    mutations: {
        setConnectState(state, value){
            state.connected = value
        },
        setPlayerData(state, value){
            state.playerData = value
        }
    },
    actions:{
    }
}

