<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
            <ion-buttons slot="start">
                <ion-menu-button color="primary"></ion-menu-button>
            </ion-buttons>
            <ion-title>Settings</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen=true>
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Settings</ion-title>
                </ion-toolbar>
            </ion-header>            

            <ion-list>
                <ion-item>
                    <ion-label position="stacked">Server IP</ion-label>
                    <ion-input v-model="server_ip" @ionBlur="setSetting('server_ip')"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Server Port</ion-label>
                    <ion-input v-model="server_port" @ionBlur="setSetting('server_port')" placeholder="8080"></ion-input>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import {computed, ref} from 'vue'
import {useStore} from 'vuex'
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
} from '@ionic/vue';
export default {
    setup() {
        const store  = useStore()

        const currentSettings = computed(() => store.state.settings.server)
        const server_ip = ref(store.state.settings.server.server_ip.value)
        const server_port = ref(store.state.settings.server.server_port.value)

        const setSetting = async(key) => {
            let value = null
            switch (key){
                case 'server_ip':
                    value = server_ip.value
                    break
                case 'server_port':
                    value = server_port.value
                    break
            }
            if (value){
                await store.dispatch('settings/setSetting', {key, value})
            }
            console.log(`${key} changed: ${value}`)

        }

        return {
            currentSettings,
            setSetting,
            server_ip,
            server_port
        }
    },
    components:{
        IonPage,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonTitle,
        IonContent,
        IonMenuButton, 
        IonList,
        IonItem,
        IonLabel,
        IonInput
    }
}
</script>