<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Open URL</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <ion-item>
                <ion-input
                    placeholder="File/URL"
                    type="text"
                    v-model="dialog.filename"
                ></ion-input>
            </ion-item>
            <ion-item>
                <ion-label>Append to playlist</ion-label>
                <ion-checkbox
                    type="text"
                    v-model="dialog.appendToPlaylist"
                ></ion-checkbox>
            </ion-item>
        </ion-content>
        <ion-footer>
            <ion-button @click="onCancelClicked">Cancel</ion-button>
            <ion-button color="success" @click="onAppendClicked">Ok</ion-button>
        </ion-footer>
    </ion-page>
</template>
<script>
import { ref } from "vue";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonCheckbox,
    IonItem,
    IonLabel,
    IonFooter,
    IonButton,
} from "@ionic/vue";

export default {
    props: ["modalController"],
    setup(props) {
        const dialog = ref({
            filename: null,
            appendToPlaylist: true,
        });
        const onAppendClicked = () => {
            console.log(`Ok, data: ${dialog.value}`);
            props.modalController.dismiss(dialog);
        };

        const onCancelClicked = () => {
            console.log("Cancel");
            props.modalController.dismiss();
        };
        return {
            dialog,
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
        IonInput,
        IonCheckbox,
        IonLabel,
        IonItem,
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
</style>
