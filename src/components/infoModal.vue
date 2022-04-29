<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onCancelClicked">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>File info</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" v-if="playerData.filename">
      <ion-list-header>Basic Info</ion-list-header>
      <ion-list>
        <ion-item
          lines="full"
          v-if="playerData['media-title'] != playerData.filename"
        >
          <ion-label class="ion-text-wrap">
            <h2>Title</h2>
            <p>{{ playerData["media-title"] }}</p>
          </ion-label>
        </ion-item>
        <ion-item lines="full">
          <ion-label class="ion-text-wrap">
            <h2>File name</h2>
            <p>{{ playerData.filename }}</p>
          </ion-label>
        </ion-item>
        <ion-item lines="full">
          <ion-label class="ion-text-wrap">
            <h2>Duration</h2>
            <p>{{ formatTime(playerData.duration) }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <template v-if="Object.keys(playerData.metadata).length > 0">
        <ion-list-header> Metadata </ion-list-header>
        <ion-list>
          <ion-item
            v-for="(value, key, i) in playerData.metadata"
            :key="i"
            lines="full"
          >
            <ion-label class="ion-text-wrap">
              <h2>{{ key }}</h2>
              <p>{{ value }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </template>
      <template v-for="track in videoTracks" :key="track.id">
        <ion-list-header
          >Video {{ track.id }}
          {{ track.selected ? "(Selected)" : "" }}</ion-list-header
        >
        <ion-list>
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Size</h2>
              <p>{{ track["demux-w"] }}x{{ track["demux-h"] }}</p>
            </ion-label>
          </ion-item>
          <ion-item lines="full">
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
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Codec</h2>
              <p>{{ track.codec }}</p>
            </ion-label>
          </ion-item>
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Language</h2>
              <p>{{ track.lang }}</p>
            </ion-label>
          </ion-item>
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Channel count</h2>
              <p>{{ track["demux-channel-count"] }}</p>
            </ion-label>
          </ion-item>
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Sample rate</h2>
              <p>{{ track["demux-samplerate"] }}</p>
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
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Codec</h2>
              <p>{{ track.codec }}</p>
            </ion-label>
          </ion-item>
          <ion-item lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Language</h2>
              <p>{{ track.lang }}</p>
            </ion-label>
          </ion-item>
          <ion-item v-if="track.external_filename" lines="full">
            <ion-label class="ion-text-wrap">
              <h2>Filename</h2>
              <p>{{ track.external_filename }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </template>
    </ion-content>
    <ion-content class="ion-padding" v-else>
      <p>No playback.</p>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { formatTime } from "../tools";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonListHeader,
  IonLabel,
  IonItem,
  IonList,
  IonIcon,
} from "@ionic/vue";
import { arrowBack } from "ionicons/icons";
export default {
  props: ["modalController"],
  setup(props) {
    const store = useStore();
    const playerData = computed(() => store.state.simpleapi.playerData);

    const audioTracks = computed(() =>
      playerData.value["track-list"].filter((el) => el.type == "audio")
    );
    const videoTracks = computed(() =>
      playerData.value["track-list"].filter((el) => el.type == "video")
    );
    const subtitleTracks = computed(() =>
      playerData.value["track-list"].filter((el) => el.type == "sub")
    );
    const onCancelClicked = () => {
      props.modalController.dismiss();
    };
    return {
      playerData,
      audioTracks,
      videoTracks,
      subtitleTracks,
      onCancelClicked,
      formatTime,
      arrowBack,
    };
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonListHeader,
    IonLabel,
    IonItem,
    IonList,
    IonButtons,
    IonIcon,
  },
};
</script>
