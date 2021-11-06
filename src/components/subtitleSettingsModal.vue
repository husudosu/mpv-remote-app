<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Subtitle settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content v-if="playerData.filename" class="ion-padding">
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
            {{ sub.lang || sub["external-filename"] }}
          </ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item @click="onAddSubtitleClicked">
        <ion-label>Add subtitle</ion-label>
      </ion-item>

      <ion-item class="subtitleDelay">
        <ion-label>Delay</ion-label>
        <ion-button @click="onSubDelayChanged('decrease')"> - </ion-button>
        {{ playerData["sub-delay"] }}
        <ion-button @click="onSubDelayChanged('increase')"> + </ion-button>
      </ion-item>
      <ion-item class="subtitleDelay">
        <ion-label>Font size</ion-label>
        <ion-button @click="onSubFontSizeChanged('decrease')"> - </ion-button>
        {{ playerData["sub-font-size"] }}
        <ion-button @click="onSubFontSizeChanged('increase')"> + </ion-button>
      </ion-item>
      <ion-item>
        <ion-label>Show subtitle</ion-label>
        <ion-checkbox
          :checked="playerData['sub-visibility']"
          @ionChange="changeSubtitleVisibility($event)"
          slot="end"
        ></ion-checkbox>
      </ion-item>

      <ion-item>
        <ion-label>ASS Override</ion-label>

        <ion-select
          @ionChange="onAssOverridechanged"
          :value="currentAssOverride"
        >
          <ion-select-option
            v-for="(item, index) in assOverride"
            :key="index"
            :value="item"
          >
            {{ item }}
          </ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>
    <ion-content class="ion-padding" v-else>
      <p>No playback.</p>
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
  IonCheckbox,
  modalController,
} from "@ionic/vue";
import filebrowsermodal from "./fileBrowserModal.vue";
import { apiInstance } from "../api";
import { assOverride } from "../tools";
import { FileBrowserActions } from "../enums";
export default {
  props: ["modalController"],
  setup(props) {
    const tracks = ref([]);
    const subTracks = ref([]);
    const activeSubTrackId = ref();
    const selectedTrack = ref({});
    const selectedAssOverride = ref("");
    const store = useStore();
    const playerData = computed(() => store.state.simpleapi.playerData);
    const currentAssOverride = computed(
      () => playerData.value["sub-ass-override"]
    );
    const loadTracks = function () {
      subTracks.value = playerData.value["track-list"].filter(
        (el) => el.type === "sub"
      );
      if (subTracks.value.length > 0) {
        activeSubTrackId.value = subTracks.value.find(
          (el) => el.selected === true
        );
        if (activeSubTrackId.value)
          activeSubTrackId.value = activeSubTrackId.value.id;
        selectedTrack.value = activeSubTrackId.value;
      }
    };
    console.log(playerData.value["sub-ass-override"]);
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
          action: FileBrowserActions.OPENSUB,
        },
      });
      modal.onDidDismiss().then((response) => {
        if (response.data && response.data.filename) {
          apiInstance.post("tracks/sub/add", {
            filename: response.data.filename,
          });
          loadTracks();
        }
      });

      await modal.present();
    };
    const onSubtitleTrackChanged = () => {
      apiInstance.post(`tracks/sub/reload/${selectedTrack.value}`);
    };

    const changeSubtitleVisibility = (event) => {
      apiInstance
        .post(`tracks/sub/visibility/${event.target.checked}`)
        .then(() => {
          store.commit("simpleapi/setPlayerDataProperty", {
            key: "sub-visibility",
            value: event.target.checked,
          });
        });
    };
    const onSubDelayChanged = (order) => {
      let newDelay = 0;
      switch (order) {
        case "increase":
          newDelay = playerData.value["sub-delay"] + 1;
          apiInstance.post(`tracks/sub/timing/${newDelay}`).then(() => {
            store.commit("simpleapi/setPlayerDataProperty", {
              key: "sub-delay",
              value: newDelay,
            });
          });
          break;
        case "decrease":
          newDelay = playerData.value["sub-delay"] - 1;
          apiInstance.post(`tracks/sub/timing/${newDelay}`).then(() => {
            store.commit("simpleapi/setPlayerDataProperty", {
              key: "sub-delay",
              value: newDelay,
            });
          });
          break;
      }
    };
    const onSubFontSizeChanged = (order) => {
      let newSize = 0;
      switch (order) {
        case "increase":
          newSize = playerData.value["sub-font-size"] + 1;
          apiInstance.post(`tracks/sub/font-size/${newSize}`).then(() => {
            store.commit("simpleapi/setPlayerDataProperty", {
              key: "sub-font-size",
              value: newSize,
            });
          });
          break;
        case "decrease":
          newSize = playerData.value["sub-font-size"] - 1;
          apiInstance.post(`tracks/sub/font-size/${newSize}`).then(() => {
            store.commit("simpleapi/setPlayerDataProperty", {
              key: "sub-font-size",
              value: newSize,
            });
          });
          break;
      }
    };
    const onAssOverridechanged = (event) => {
      apiInstance
        .post(`/tracks/sub/ass-override/${event.target.value}`)
        .then(() => console.log("changed"));
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
      onAddSubtitleClicked,
      onSubFontSizeChanged,
      onAssOverridechanged,
      changeSubtitleVisibility,
      currentAssOverride,
      selectedAssOverride,
      assOverride,
      playerData,
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
