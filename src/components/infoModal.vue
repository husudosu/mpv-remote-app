<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>File info</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-list-header>Basic Info</ion-list-header>
            <ion-list>
                <ion-item>
                    <ion-label>Title</ion-label>
                    <ion-label class="prop">{{ playerData.media_title }}</ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>Filename</ion-label>
                    <ion-label>{{ playerData.filename }}</ion-label>
                </ion-item>
                <ion-item>
                    <ion-label>Duration</ion-label>
                    <ion-label>{{ playerData.duration }}</ion-label>
                </ion-item>
            </ion-list>

            <template v-for="track in videoTracks" :key=track.id>
                <ion-list-header>Video {{ track.id }} {{ track.selected ? "(Selected)" : ""}}</ion-list-header>
                <ion-list>
                        <ion-item>
                            <ion-label>Size</ion-label>
                            <ion-label>{{ track.demuxW }}x{{ track.demuxH }}</ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>Codec</ion-label>
                            <ion-label>{{ track.codec }}</ion-label>
                        </ion-item>
            </ion-list>
            </template>

            <template v-for="track in audioTracks" :key=track.id>
                <ion-list-header>Audio {{ track.id }} {{ track.selected ? "(Selected)" : ""}}</ion-list-header>
                <ion-list>
                        <ion-item>
                            <ion-label>Codec</ion-label>
                            <ion-label>{{ track.codec }}</ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>Language</ion-label>
                            <ion-label>{{ track.lang }}</ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>Channel count</ion-label>
                            <ion-label>{{ track.demuxChannelCount }}</ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>Sample rate</ion-label>
                            <ion-label>{{ track.demuxSamplerate }}</ion-label>
                        </ion-item>
                </ion-list>
            </template>
            <template v-for="track in subtitleTracks" :key=track.id>
                <ion-list-header>Subtitle {{ track.id }} {{ track.selected ? "(Selected)" : ""}}</ion-list-header>
                <ion-list>
                        <ion-item>
                            <ion-label>Codec</ion-label>
                            <ion-label>{{ track.codec }}</ion-label>
                        </ion-item>
                        <ion-item>
                            <ion-label>Language</ion-label>
                            <ion-label>{{ track.lang }}</ion-label>
                        </ion-item>
                        <ion-item v-if="track.external_filename">
                            <ion-label>Filename</ion-label>
                            <ion-label>{{ track.external_filename }}</ion-label>
                        </ion-item>
                </ion-list>
            </template>
        </ion-content>
        <ion-footer>
            <ion-button @click="onCancelClicked">Close</ion-button>
        </ion-footer>
    </ion-page>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton

} from '@ionic/vue';

export default {
    props: [
        "modalController"
    ],
    setup(props) {
        const store = useStore();
        const playerData = computed(() => store.state.mpvsocket.playerData);
        
        const audioTracks = computed(() => playerData.value.currentTracks.filter((el) => el.type == 'audio'));
        const videoTracks = computed(() => playerData.value.currentTracks.filter((el) => el.type == 'video'));
        const subtitleTracks = computed(() => playerData.value.currentTracks.filter((el) => el.type == 'sub'));

        console.log(subtitleTracks);

        const dialog = ref({
            filename: null,
            appendToPlaylist: true
        });
        const onCancelClicked = () => {
            console.log("Cancel");
            props.modalController.dismiss();
        };
        return {
            dialog,
            playerData,
            audioTracks,
            videoTracks,
            subtitleTracks,
            onCancelClicked
        };
    },
    components:{
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonFooter,
        IonButton
    },

}
</script>

<style scoped>
ion-footer {
    padding: 10px;
    text-align: right;
}

ion-footer ion-button {
    width: 120px;
}

.prop {
    overflow: scroll;
}

</style>