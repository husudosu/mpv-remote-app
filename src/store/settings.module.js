

import { Storage } from '@capacitor/storage'

const initialState = {
    server: {
        server_ip: null,
        server_port: 8000,
    },
    configured: true
}

export const settings = {
    namespaced: true,
    state: {...initialState},
    mutations: {
        setAppSettings(state, value){
            state.server = value
        },
        setConfigured(state, value){
            state.configured = value
        }
    },
    actions: {
        loadSettings: async function({commit}) {
            const server_ip = await Storage.get({ key: "server_ip"})
            const server_port = await Storage.get({ key: "server_port" })
            console.log(`Config variables: ${server_ip.value} ${server_port.value}`)

            if (!server_ip.value || !server_port.value ){
                commit('setConfigured', false)
            }
            commit('setAppSettings', {server_ip, server_port})
        },
        setSetting: async function({dispatch}, payload){
            await Storage.set({
                key: payload.key,
                value: payload.value
            })
            dispatch("loadSettings")
        }
    }
}