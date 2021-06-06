const initialState = {
    connected: false,
    playerData: {
        playback_time: '00:00:00',
        pause: true,
        percent_pos: 0,
        volume: null,
        fullscreen: null,
        mute: null,
        filename: null,
        duration: '00:00:00',
        media_title: null,
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
            // If paused remove playback update.
            console.log(`Committing ${value}`)
            state.playerData.pause = value
        },
        // On EOF or Playback stopped
        resetPlayback(state){
            state.playerData.filename = null;
            state.playerData.duration = '00:00:00';
            state.playerData.playback_time = '00:00:00';
            state.playerData.percent_pos = 0;
            state.playerData.media_title = null;
        }
    },
    actions:{
    },
}

