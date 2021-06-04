

const initialState = {
    connected: false,
    playerData: {
        playback_time: null,
        pause: true,
        time: null,
        percent_pos: 0,
        volume: null,
        subtitles: null,
        audio: null,
        fullscreen: null,
        mute: null,
        subtitle_tracks: [],
        audio_tracks: [],
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
        },
        setPlayback(state, value){
            state.playerData.playback_time = value.playback_time
            if (value.percent_pos){
                state.playerData.percent_pos = value.percent_pos
            }
        },
        setPause(state, value){
            console.log(`Committing ${value}`)
            state.playerData.pause = value
        }
    },
    actions:{
    },
    getters:{
        percent_pos: state => { console.log(state.playerData.percent_pos); return state.playerData.percent_pos}
    }
}

