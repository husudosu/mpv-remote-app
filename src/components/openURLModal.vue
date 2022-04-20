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
      <ion-item lines="full">
        <ion-label>Youtube quality</ion-label>
        <ion-select v-model="dialog['file-local-options']['ytdl-format']">
          <ion-select-option value="">Default</ion-select-option>
          <ion-select-option value="bestvideo[height<=?2160]+bestaudio/best"
            >4k</ion-select-option
          >
          <ion-select-option value="bestvideo[height<=?1440]+bestaudio/best"
            >1440p</ion-select-option
          >
          <ion-select-option value="bestvideo[height<=?1080]+bestaudio/best"
            >1080p</ion-select-option
          >
          <ion-select-option value="bestvideo[height<=?720]+bestaudio/best"
            >720p</ion-select-option
          >
          <ion-select-option value="bestvideo[height<=?480]+bestaudio/best"
            >480p</ion-select-option
          >
        </ion-select>
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
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import { arrowBack } from "ionicons/icons";
import { loadFileFlags } from "../tools";

export default {
  props: ["modalController"],
  setup(props) {
    const dialog = ref({
      filename: "",
      appendToPlaylist: true,
      "file-local-options": {
        "ytdl-format": "",
      },
    });

    const onAppendClicked = () => {
      if (dialog.value.appendToPlaylist) {
        dialog.value.flag = loadFileFlags.APPEND_PLAY;
      } else {
        dialog.value.flag = loadFileFlags.REPLACE;
      }

      delete dialog.value.appendToPlaylist;
      // if (dialog.value["file-local-options"]["ytdl-format"].length === 0) {
      //   delete dialog.value["file-local-options"]["ytdl-format"];
      // }

      props.modalController.dismiss(dialog.value);
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
    IonSelect,
    IonSelectOption,
  },
};
</script>
