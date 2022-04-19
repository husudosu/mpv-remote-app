<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onCancelClicked">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Open URL</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item lines="full">
        <ion-input
          placeholder="File/URL"
          type="text"
          v-model="dialog.filename"
        ></ion-input>
      </ion-item>
      <ion-item lines="full">
        <ion-label>Append to playlist</ion-label>
        <ion-checkbox
          type="text"
          v-model="dialog.appendToPlaylist"
        ></ion-checkbox>
      </ion-item>
      <ion-button
        expand="block"
        style="margin-top: 10px"
        :disabled="dialog.filename.length == 0"
        color="success"
        @click="onAppendClicked"
        >Open
      </ion-button>
    </ion-content>
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
  IonButton,
  IonButtons,
} from "@ionic/vue";
import { arrowBack } from "ionicons/icons";
export default {
  props: ["modalController"],
  setup(props) {
    const dialog = ref({
      filename: "",
      appendToPlaylist: true,
      "file-local-options": {
        "ytdl-format": "bestvideo[height<=?720]+bestaudio/best",
      },
    });
    const onAppendClicked = () => {
      props.modalController.dismiss(dialog);
    };

    const onCancelClicked = () => {
      props.modalController.dismiss();
    };
    return {
      arrowBack,
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
    IonButton,
    IonButtons,
  },
};
</script>
