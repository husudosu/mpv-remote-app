<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ files.dirname || "N/A" }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item @click="onPrevDirectoryClicked" v-if="files.prevDir">
                <ion-icon :icon="folder" slot="start"></ion-icon>
                ...
            </ion-item>
            <ion-item
                v-for="(directory, index) in files.directories"
                :key="index"
                @click="onDirectoryClicked(directory)"
            >
                <ion-icon :icon="folder" slot="start"></ion-icon>
                {{ directory.name }}
            </ion-item>
            <ion-item
                v-for="(file, index) in files.files"
                :key="index"
                @click="onFileClicked(file)"
            >
                <ion-icon :icon="document" slot="start"></ion-icon>
                {{ file.name }}
            </ion-item>
        </ion-content>
        <ion-footer>
            <ion-button @click="onCancelClicked">Close</ion-button>
            <ion-button @click="onOpenDirectoryClicked" color="success">
                Open folder
            </ion-button>
        </ion-footer>
    </ion-page>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

// import { socket } from '../socketClient';

import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonFooter,
    IonButton,
    IonIcon,
} from "@ionic/vue";
import { folder, document, add } from "ionicons/icons";
import axios from "axios";

export default {
    props: ["modalController"],
    setup(props) {
        const store = useStore();

        const files = ref([]);
        const baseURL = computed(
            () =>
                `http://${store.state.settings.server.server_ip.value}:${store.state.settings.server.server_port.value}`
        );

        axios
            .get(`${baseURL.value}/fileman?path=/home/sudosu`)
            .then((response) => {
                console.log(response.data);
                files.value = response.data;
            });
        const onCancelClicked = () => {
            console.log("Cancel");
            props.modalController.dismiss();
        };

        const onFileClicked = (file) => {
            props.modalController.dismiss(file.fullPath);
        };

        const onDirectoryClicked = (directory) => {
            axios
                .get(`${baseURL.value}/fileman?path=${directory.fullPath}`)
                .then((response) => {
                    console.log(response.data);
                    files.value = response.data;
                });
        };

        const onPrevDirectoryClicked = () => {
            axios
                .get(`${baseURL.value}/fileman?path=${files.value.prevDir}`)
                .then((response) => {
                    files.value = response.data;
                });
        };

        const onOpenDirectoryClicked = () => {
            props.modalController.dismiss(files.value.cwd);
        };

        return {
            onCancelClicked,
            onFileClicked,
            onDirectoryClicked,
            onPrevDirectoryClicked,
            onOpenDirectoryClicked,
            files,
            folder,
            document,
            add,
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
        IonIcon,
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
