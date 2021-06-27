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
            <ion-toolbar>
                <ion-button @click="onClearPlaylistClicked" size="small">
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
import {socket} from '../socketClient'

export default {
    setup() {

        const store = useStore();
        const playerData = computed(() => store.state.mpvsocket.playerData);
        const DOUBLE_CLICK_THRESHOLD = 500;
        let lastOnStart = 0;

        const doReorder = async(event) => {
            let fromIndex = event.detail.from;
            let toIndex = event.detail.to;

            const itemIndex = playerData.value.playlist[event.detail.from].index;
            console.log(itemIndex)

            console.log(`Move element from ${fromIndex} to ${toIndex}`);

            // We moving element down.
            if (toIndex > fromIndex){
                toIndex += 2;
            }

            socket.emit("playlistMove", {fromIndex, toIndex}, function(data){
                console.log(`${JSON.stringify(data)}`)
                store.commit('mpvsocket/setProp', {property: 'playlist', value: data.playlist})
                event.detail.complete(true);
                console.log(`Callback done, updated playlist: ${JSON.stringify(data.playlist)}`);
            })
        }
        
        const onPreLoadPlaylistClicked = () => {
            // Loads few playlist item for testing.
            socket.emit("openFile", {filename: "/home/sudosu/test.webm", appendToPlaylist: true});
            socket.emit("openFile", {filename: "/home/sudosu/test1.mkv", appendToPlaylist: true}); 
        };
        
        const onClearPlaylistClicked = () => {
            socket.emit("playlistClear");
        }

        const onRemoveItemClicked = (item) => {
            socket.emit("playlistRemove", item.index);
        };

        const onItemClicked = (item) => {
            /* TODO: Create double tap gesture somehow for ion-item.
            https://ionicframework.com/docs/utilities/gestures
            I'm using my own shitty solution for this, because dunno how to add all ion-item elements to gesture.
            But it works :-)*/
            const now = Date.now();

            if (Math.abs(now - lastOnStart) <= DOUBLE_CLICK_THRESHOLD) {
                console.log("Double clicked");
                socket.emit('playlistPlayIndex', item.index);
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
            onRemoveItemClicked,
            onClearPlaylistClicked
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