<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="#fff"></ion-menu-button>
        </ion-buttons>
        <ion-title>MPV Remote</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">MPV Remote</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-list>
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2>License</h2>
            <p>MIT</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2>Made by</h2>
            <p>Ferenc Nánási</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2>Version</h2>
            <p>{{ version }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list-header>MPV Info</ion-list-header>
      <ion-list>
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2>Version</h2>
            <p>{{ MPVInfo["mpv-version"] }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2>FFMPEG</h2>
            <p>{{ MPVInfo["ffmpeg-version"] }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label class="ion-text-wrap">
            <h2>Libass</h2>
            <p>{{ MPVInfo["libass-version"] }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <ion-list-header> MPVRemote plugin config </ion-list-header>
      <ion-list>
        <ion-item v-for="(val, prop, i) in MPVInfo.mpvremoteConfig" :key="i">
          <ion-label class="ion-text-wrap">
            <h2>{{ prop }}</h2>
            <p>{{ val }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
      <div class="contactButtons">
        <ion-button
          @click="openURL('https://github.com/husudosu/mpv-remote-app')"
        >
          <ion-icon slot="icon-only" :icon="logoGithub"> </ion-icon>
        </ion-button>
        <ion-button
          @click="openURL('https://github.com/husudosu/mpv-remote-app')"
        >
          <ion-icon slot="icon-only" :icon="helpOutline"> </ion-icon>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonListHeader,
} from "@ionic/vue";
import { logoGithub, helpOutline } from "ionicons/icons";
import { useStore } from "vuex";
import { computed } from "vue";
import appInfo from "../verinfo";
export default {
  setup() {
    const openURL = (url) => {
      window.open(url, "_system");
    };
    const store = useStore();
    const MPVInfo = computed(() => store.state.simpleapi.MPVInfo);
    return {
      logoGithub,
      helpOutline,
      openURL,
      MPVInfo,
      version: appInfo.version,
    };
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonListHeader,
  },
};
</script>

<style scoped>
.contactButtons {
  margin-top: 10px;
  text-align: center;
}

.contactButtons ion-button {
  margin: 5px;
}
</style>
