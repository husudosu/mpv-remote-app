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
                <ion-button size="small" @click="onPreLoadPlaylistClicked"> 
                    Preload playlist
                </ion-button>
            </ion-toolbar>

            <ion-reorder-group @ionItemReorder="doReorder($event)" :disabled="playerData.playlist.length <= 1 ">
                    <ion-item @click="onItemClicked(item)" v-for="item in playerData.playlist" :key="item.id">
                        <ion-label>
                            <ion-icon v-if="item.current" slot="start" :icon="playOutline"></ion-icon>
                                {{ item.filename }}
                        </ion-label>
                        <ion-button  @click="onRemoveItemClicked(item)" fill="clear" slot="end">
                            <ion-icon slot="icon-only" :icon="trashBin"></ion-icon>
                        </ion-button>
                        <ion-reorder slot="end"></ion-reorder>
                    </ion-item>
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
import {connect, socket} from '../socketClient'

export default {
    setup() {

        const store = useStore();
        const playerData = computed(() => store.state.mpvsocket.playerData);
        const DOUBLE_CLICK_THRESHOLD = 500;
        let lastOnStart = 0;

        if (store.state.settings.configured && !store.state.mpvsocket.connected){
            connect();
        }

        const doReorder = async(event) => {
            const fromIndex = event.detail.from;
            const toIndex = event.detail.to;
            console.log(`Move element from ${fromIndex} to ${toIndex}`);
            await socket.emit("playlistMove", {fromIndex, toIndex});
            event.detail.complete();
        }
        
        const onPreLoadPlaylistClicked = () => {
            // Loads few playlist item for testing.
            socket.emit("openFile", {filename: "/home/sudosu/test.webm", appendToPlaylist: true});
            socket.emit("openFile", {filename: "/home/sudosu/test1.mkv", appendToPlaylist: true}); 
        };
        
        const onRemoveItemClicked = (item) => {
            socket.emit("playlistRemove", item.index)
        };

        const onItemClicked = (item) => {
            /* TODO: Create double tap gesture somehow for ion-item.
            https://ionicframework.com/docs/utilities/gestures
            I'm using my own shitty solution for this, because dunno how to add all ion-item elements to gesture.
            But it works :-)*/
            const now = Date.now();

            if (Math.abs(now - lastOnStart) <= DOUBLE_CLICK_THRESHOLD) {
                console.log("Double clicked");
                socket.emit('playlistPlayIndex', item.id - 1);
                lastOnStart = 0;
            } else {
                lastOnStart = now;
            }
            
        }

        return {
            playerData,
            playOutline,
            add,
            remove,
            trashBin,
            doReorder,
            onItemClicked,
            onPreLoadPlaylistClicked,
            onRemoveItemClicked
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