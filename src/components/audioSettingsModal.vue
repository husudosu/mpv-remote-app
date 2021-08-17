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
        <ion-select
          :value="activeAudioTrackId"
          @ionChange="onSwitchAudioClicked"
          v-model="selectedTrack"
        >
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
import { ref, computed } from "vue";
import { useStore } from "vuex";

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
// import { apiInstance } from "../api";

export default {
  props: ["modalController"],
  setup(props) {
    const tracks = ref([]);
    const audioTracks = ref([]);
    const activeAudioTrackId = ref();
    const selectedTrack = ref();
    const store = useStore();
    const playerData = computed(() => store.state.simpleapi.playerData);

    audioTracks.value = playerData.value["track-list"].filter(
      (el) => el.type === "audio"
    );
    activeAudioTrackId.value = audioTracks.value.find(
      (el) => el.selected === true
    ).id;
    selectedTrack.value = activeAudioTrackId.value;

    const onCancelClicked = () => {
      props.modalController.dismiss();
    };

    const onSwitchAudioClicked = () => {
      console.log(selectedTrack);

      // TODO !
      console.log("Audio select track by ID not supported by simple mpv api");
      // console.log(`Selected audio track: ${selectedTrack.value}`);
      // store.state.mpvsocket.socket.emit("audioReload", selectedTrack.value);
      // apiInstance.post(`/api/set/:name/:value`)
    };

    return {
      tracks,
      audioTracks,
      activeAudioTrackId,
      selectedTrack,
      onCancelClicked,
      onSwitchAudioClicked,
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
