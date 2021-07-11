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
                <ion-item v-if="playerData.media_title != playerData.filename">
                    <ion-label class="ion-text-wrap">
                        <h2>Title</h2>
                        <p>{{ playerData.media_title }}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label class="ion-text-wrap">
                        <h2>File name</h2>
                        <p>{{ playerData.filename }}</p>
                    </ion-label>
                </ion-item>
                <ion-item>
                    <ion-label class="ion-text-wrap">
                        <h2>Duration</h2>
                        <p>{{ playerData.duration }}</p>
                    </ion-label>
                </ion-item>
            </ion-list>
            <template v-for="track in videoTracks" :key="track.id">
                <ion-list-header
                    >Video {{ track.id }}
                    {{ track.selected ? "(Selected)" : "" }}</ion-list-header
                >
                <ion-list>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Size</h2>
                            <p>{{ track.demuxW }}x{{ track.demuxH }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Codec</h2>
                            <p>{{ track.codec }}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </template>
            <template v-for="track in audioTracks" :key="track.id">
                <ion-list-header
                    >Audio {{ track.id }}
                    {{ track.selected ? "(Selected)" : "" }}</ion-list-header
                >
                <ion-list>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Codec</h2>
                            <p>{{ track.codec }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Language</h2>
                            <p>{{ track.lang }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Channel count</h2>
                            <p>{{ track.demuxChannelCount }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Sample rate</h2>
                            <p>{{ track.demuxSamplerate }}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </template>
            <template v-for="track in subtitleTracks" :key="track.id">
                <ion-list-header
                    >Subtitle {{ track.id }}
                    {{ track.selected ? "(Selected)" : "" }}</ion-list-header
                >
                <ion-list>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Codec</h2>
                            <p>{{ track.codec }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <h2>Language</h2>
                            <p>{{ track.lang }}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-if="track.external_filename">
                        <ion-label class="ion-text-wrap">
                            <h2>Filename</h2>
                            <p>{{ track.external_filename }}</p>
                        </ion-label>
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
import { ref, computed } from "vue";
import { useStore } from "vuex";

import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton,
} from "@ionic/vue";

export default {
    props: ["modalController"],
    setup(props) {
        const store = useStore();
        const playerData = computed(() => store.state.mpvsocket.playerData);

        const audioTracks = computed(() =>
            playerData.value.currentTracks.filter((el) => el.type == "audio")
        );
        const videoTracks = computed(() =>
            playerData.value.currentTracks.filter((el) => el.type == "video")
        );
        const subtitleTracks = computed(() =>
            playerData.value.currentTracks.filter((el) => el.type == "sub")
        );

        console.log(subtitleTracks);

        const dialog = ref({
            filename: null,
            appendToPlaylist: true,
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
            onCancelClicked,
        };
    },
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonFooter,
        IonButton,
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

.prop {
    overflow: scroll;
}
</style>
