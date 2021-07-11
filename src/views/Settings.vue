<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="#fff"></ion-menu-button>
                </ion-buttons>
                <ion-title>Settings</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Settings</ion-title>
                </ion-toolbar>
            </ion-header>

            <ion-list>
                <ion-item>
                    <ion-label position="stacked">Server IP</ion-label>
                    <ion-input
                        v-model="server_ip"
                        @ionBlur="setSetting('server_ip')"
                    ></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">Server Port</ion-label>
                    <ion-input
                        v-model="server_port"
                        @ionBlur="setSetting('server_port')"
                        placeholder="8000"
                        type="number"
                    ></ion-input>
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
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
} from "@ionic/vue";
import { connect, disconnect } from "../socketClient";
export default {
    setup() {
        const store = useStore();
        const router = useRouter();
        const currentSettings = computed(() => store.state.settings.server);
        const server_ip = ref(store.state.settings.server.server_ip.value);
        const server_port = ref(store.state.settings.server.server_port.value);

        const setSetting = async (key) => {
            let value = null;
            let shouldReconnect = false;
            switch (key) {
                case "server_ip":
                    value = server_ip.value;
                    shouldReconnect = true;
                    break;
                case "server_port":
                    value = server_port.value;
                    shouldReconnect = true;
                    break;
            }
            if (value) {
                await store.dispatch("settings/setSetting", { key, value });
                await store.dispatch("settings/loadSettings");

                if (shouldReconnect) {
                    console.log("Should reconnect");
                    await disconnect();
                    await connect();
                }
            }
            console.log(`${key} changed: ${value}`);
        };

        const mediaCollectionsClicked = () => {
            router.push({ name: "folder.settings.collections" });
        };

        return {
            currentSettings,
            setSetting,
            server_ip,
            server_port,
            mediaCollectionsClicked,
        };
    },
    components: {
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
        IonInput,
    },
};
</script>
