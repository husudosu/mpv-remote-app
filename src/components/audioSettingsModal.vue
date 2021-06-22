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
                <ion-select>
                    <ion-select-option v-for="audio in tracks" :key="audio.id">
                        {{ audio.type }}
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
import { ref } from 'vue';
import { socket } from '../socketClient';

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

} from '@ionic/vue';

export default {
    props: [
        "modalController"
    ],
    setup(props) {
        const tracks = ref([]);

        // get tracks
        socket.emit('tracks', null,  function(data) {
            console.log("Callback done")
            console.log(JSON.stringify(data))
            tracks.value = data
        })

        const getTracks = async() => {
            console.log("Getting tracks")
        };
        
        const onAppendClicked = () => {
            // TODO: Change audio track
            props.modalController.dismiss();
        };

        const onCancelClicked = () => {
            console.log("Cancel");
            props.modalController.dismiss();
        };

        getTracks();
        console.log(`Tracks: ${tracks.value}`);

        return {
            tracks,
            onAppendClicked,
            onCancelClicked
        };
    },
    components:{
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

</style>