<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="primary"></ion-menu-button>
                </ion-buttons>
                <ion-title>Playlist</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Playlist</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-toolbar>
                <ion-button size="small">
                    <ion-icon :icon="trashBin"></ion-icon>
                </ion-button>

            </ion-toolbar>

            <ion-reorder-group :disabled="playerData.playlist.length > 0 ">
                <ion-reorder>
                    <ion-item v-for="item in playerData.playlist" :key="item.id">
                        <ion-label>
                            <ion-icon v-if="item.playing" slot="start" :icon="playOutline"></ion-icon>
                            {{ item.media_title || item.filename }}
                        </ion-label>
                    </ion-item>
                </ion-reorder>
            </ion-reorder-group>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonReorder,
    IonReorderGroup,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
} from '@ionic/vue';
import { playOutline, add, remove, trashBin } from 'ionicons/icons';
import { computed } from 'vue';
import {useStore} from 'vuex';

import {connect} from '../socketClient'

export default {
    setup() {
        const store = useStore();
        const playerData = computed(() => store.state.mpvsocket.playerData);
        // Connect if needed.
        if (store.state.settings.configured && !store.state.mpvsocket.connected){
            connect();
        }

        return {
            playerData,
            playOutline,
            add,
            remove,
            trashBin
        }
    },
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonTitle,
        IonContent,
        IonReorder,
        IonReorderGroup,
        IonItem,
        IonLabel,
        IonIcon,
        IonButton
    }
}
</script>
<style scoped>
    ion-toolbar {
        margin: 0px 10px 0px 10px;
    }
</style>