<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Subtitle settings</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-label>Subtitle</ion-label>
                <ion-select v-model="selectedTrack" @ionChange="onSubtitleTrackChanged" :value="activeSubTrackId">
                    <ion-select-option :value="sub.id" v-for="sub in subTracks" :key="sub.id" >
                        {{ sub.lang || sub.external_filename }}
                    </ion-select-option>
                </ion-select>
            </ion-item>

            <ion-item class="subtitleDelay">
                <ion-label>Delay</ion-label>
                <ion-button @click="onSubDelayChanged('decrease')">
                    -
                </ion-button>
                {{ subSettings.subDelay }}
                <ion-button @click="onSubDelayChanged('increase')">
                    +
                </ion-button>
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
        const subTracks = ref([]);
        const activeSubTrackId = ref();
        const selectedTrack = ref({});
        const subSettings = ref({
            subDelay: 0,
        });

        // get tracks
        socket.emit('tracks', null, function(data) {
            tracks.value = data.tracks;
            subTracks.value = data.tracks.filter((el) => el.type === "sub");
            activeSubTrackId.value = subTracks.value.find((el) => el.selected === true).id
            selectedTrack.value = activeSubTrackId.value
            console.log(subTracks.value)
        })

        socket.emit('subSettings', null, function(data){
            subSettings.value = data;
        })
        
        const onAppendClicked = () => {
            // TODO: Change audio track
            props.modalController.dismiss();
        };

        const onCancelClicked = () => {
            console.log("Cancel");
            props.modalController.dismiss();
        };

        const onSubtitleTrackChanged = () => {
            console.log(JSON.stringify(selectedTrack.value));
            socket.emit('subReload', selectedTrack.value);
        }

        const onSubDelayChanged = (order) => {
            switch (order){
                case 'increase':
                    subSettings.value.subDelay += 1;
                    socket.emit("adjustSubtitleTiming", subSettings.value.subDelay);
                    break;
                case 'decrease':
                    subSettings.value.subDelay -= 1;
                    socket.emit("adjustSubtitleTiming", subSettings.value.subDelay);
                    break;
            }
        }
        return {
            tracks,
            subTracks,
            activeSubTrackId,
            onAppendClicked,
            onCancelClicked,
            onSubtitleTrackChanged,
            onSubDelayChanged,
            selectedTrack,
            subSettings
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

.subtitleDelay ion-button {
    width: 26px;
    height: 26px;
    margin: 10px;
}
</style>