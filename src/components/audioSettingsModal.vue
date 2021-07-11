<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Audio settings</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-label>Audio track</ion-label>
                <ion-select :value="activeAudioTrackId">
                    <ion-select-option
                        :value="audio.id"
                        v-for="audio in audioTracks"
                        :key="audio.id"
                    >
                        {{ audio.lang }}
                    </ion-select-option>
                </ion-select>
            </ion-item>
        </ion-content>
        <ion-footer>
            <ion-button @click="onCancelClicked">Close</ion-button>
        </ion-footer>
    </ion-page>
</template>
<script>
import { ref } from "vue";
import { socket } from "../socketClient";

import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonFooter,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonLabel,
} from "@ionic/vue";

export default {
    props: ["modalController"],
    setup(props) {
        const tracks = ref([]);
        const audioTracks = ref([]);
        const activeAudioTrackId = ref();

        // get tracks
        socket.emit("tracks", null, function (data) {
            tracks.value = data.tracks;
            audioTracks.value = data.tracks.filter((el) => el.type === "audio");
            activeAudioTrackId.value = audioTracks.value.find(
                (el) => el.selected === true
            ).id;
        });

        const onAppendClicked = () => {
            // TODO: Change audio track
            props.modalController.dismiss();
        };

        const onCancelClicked = () => {
            console.log("Cancel");
            props.modalController.dismiss();
        };

        return {
            tracks,
            audioTracks,
            activeAudioTrackId,
            onAppendClicked,
            onCancelClicked,
        };
    },
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonItem,
        IonFooter,
        IonButton,
        IonSelect,
        IonSelectOption,
        IonLabel,
    },
};
</script>

<style scoped>
ion-footer {
    padding: 10px;
    text-align: right;
}

ion-footer ion-button {
    width: 120px;
}
</style>
