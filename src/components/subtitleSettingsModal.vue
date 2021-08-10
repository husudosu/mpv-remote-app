<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Subtitle settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Track</ion-label>
        <ion-select
          v-model="selectedTrack"
          @ionChange="onSubtitleTrackChanged"
          :value="activeSubTrackId"
        >
          <ion-select-option
            :value="sub.id"
            v-for="sub in subTracks"
            :key="sub.id"
          >
            {{ sub.lang || sub.external_filename }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item class="subtitleDelay">
        <ion-label>Delay</ion-label>
        <ion-button @click="onSubDelayChanged('decrease')"> - </ion-button>
        {{ subSettings.subDelay }}
        <ion-button @click="onSubDelayChanged('increase')"> + </ion-button>
      </ion-item>
      <ion-item>
        <ion-label>Show subtitle</ion-label>
        <ion-checkbox
          v-model="subSettings.subVisibility"
          @ionChange="changeSubtitleVisibility($event)"
          slot="end"
        ></ion-checkbox>
      </ion-item>
      <ion-item @click="onAddSubtitleClicked">
        <ion-label>Add subtitle</ion-label>
      </ion-item>
    </ion-content>
    <ion-footer>
      <ion-button @click="onCancelClicked">Close</ion-button>
    </ion-footer>
  </ion-page>
</template>
<script>
import { ref } from "vue";
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
  IonCheckbox,
  modalController,
} from "@ionic/vue";
import filebrowsermodal from "./fileBrowserModal.vue";

export default {
  props: ["modalController"],
  setup(props) {
    const tracks = ref([]);
    const subTracks = ref([]);
    const activeSubTrackId = ref();
    const selectedTrack = ref({});
    const subSettings = ref({
      subDelay: 0,
      subVisibility: false,
    });
    const store = useStore();
    store.state.mpvsocket.socket.emit("subSettings", null, function (data) {
      subSettings.value = data;
      console.log(subSettings.value);
    });

    const loadTracks = function () {
      store.state.mpvsocket.socket.emit("tracks", null, function (data) {
        tracks.value = data.tracks;

        subTracks.value = data.tracks.filter((el) => el.type === "sub");
        if (subTracks.value.length > 0) {
          activeSubTrackId.value = subTracks.value.find(
            (el) => el.selected === true
          );
          if (activeSubTrackId.value)
            activeSubTrackId.value = activeSubTrackId.value.id;
          selectedTrack.value = activeSubTrackId.value;
        }
      });
    };

    const onAppendClicked = () => {
      props.modalController.dismiss();
    };

    const onCancelClicked = () => {
      props.modalController.dismiss();
    };

    const onAddSubtitleClicked = async () => {
      const modal = await modalController.create({
        component: filebrowsermodal,
        componentProps: {
          modalController: props.modalController,
          action: "opensub",
        },
      });
      modal.onDidDismiss().then((response) => {
        if (response.data && response.data.filename) {
          store.state.mpvsocket.socket.emit(
            "addSubtitles",
            response.data.filename
          );
          // reload tracks
          loadTracks();
        }
      });

      await modal.present();
    };
    const onSubtitleTrackChanged = () => {
      store.state.mpvsocket.socket.emit("subReload", selectedTrack.value);
    };

    const changeSubtitleVisibility = (event) => {
      subSettings.value.subVisibility = event.target.checked;
      store.state.mpvsocket.socket.emit("setPlayerProp", [
        "sub-visibility",
        event.target.checked,
      ]);
    };
    const onSubDelayChanged = (order) => {
      switch (order) {
        case "increase":
          subSettings.value.subDelay += 1;
          store.state.mpvsocket.socket.emit(
            "adjustSubtitleTiming",
            subSettings.value.subDelay
          );
          break;
        case "decrease":
          subSettings.value.subDelay -= 1;
          store.state.mpvsocket.socket.emit(
            "adjustSubtitleTiming",
            subSettings.value.subDelay
          );
          break;
      }
    };
    loadTracks();
    return {
      tracks,
      subTracks,
      activeSubTrackId,
      onAppendClicked,
      onCancelClicked,
      onSubtitleTrackChanged,
      onSubDelayChanged,
      selectedTrack,
      subSettings,
      onAddSubtitleClicked,
      changeSubtitleVisibility,
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
    IonCheckbox,
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

.subtitleDelay ion-button {
  width: 26px;
  height: 26px;
  margin: 10px;
}
</style>
