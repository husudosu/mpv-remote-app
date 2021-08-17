<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="#fff"></ion-menu-button>
        </ion-buttons>
        <ion-title>
          {{ playerTitle }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="serverConfigured">
      <ion-grid style="height: 100%">
        <ion-row class="remoteButtons">
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button @click="changeVolume('decrease')">
              <ion-icon slot="icon-only" :icon="volumeLowOutline"></ion-icon>
            </ion-button>
            <ion-button @click="changeVolume('mute')">
              <ion-icon slot="icon-only" :icon="volumeMuteOutline"></ion-icon>
            </ion-button>
            <ion-button @click="changeVolume('increase')">
              <ion-icon slot="icon-only" :icon="volumeHighOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button @click="onInfoClicked">
              <ion-icon slot="icon-only" :icon="informationCircle"></ion-icon>
            </ion-button>
            <ion-button @click="onFullscreenClicked">
              <ion-icon slot="icon-only" :icon="scanOutline"></ion-icon>
            </ion-button>
            <ion-button @click="onAudioSettingsClicked">
              <ion-icon slot="icon-only" :icon="earOutline"></ion-icon>
            </ion-button>
            <ion-button @click="onSubtitleSettingsClicked">
              <ion-icon
                class="rotateIcon"
                slot="icon-only"
                :icon="journalOutline"
              ></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button :disabled=true @click="onFileBrowserClicked">
              <ion-icon slot="icon-only" :icon="folder"></ion-icon>
            </ion-button>
            <ion-button @click="onOpenURLClicked">
              <ion-icon slot="icon-only" :icon="logoYoutube"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="playerData.chapters == 0"
              @click="onChaptersClicked"
            >
              <ion-icon slot="icon-only" :icon="bookOutline"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-content v-else>
      <ion-grid>
        <ion-row>
          <ion-col
            >Server not configued yet.
            <p>
              If you need help
              <a @click="openURL('https://github.com/husudosu/mpv-remote-app')"
                >check tutorial here</a
              >
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <playerController v-if="serverConfigured"></playerController>
  </ion-page>
</template>

<script>
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  modalController,
  actionSheetController,
} from "@ionic/vue";

import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import {
  volumeHighOutline,
  volumeLowOutline,
  volumeMuteOutline,
  logoYoutube,
  folder,
  scanOutline,
  journalOutline,
  earOutline,
  informationCircle,
  bookOutline,
} from "ionicons/icons";
import openURLModal from "../components/openURLModal.vue";
import audioSettingsModal from "../components/audioSettingsModal.vue";
import subtitleSettingsModal from "../components/subtitleSettingsModal.vue";
import fileBrowserModal from "../components/fileBrowserModal.vue";
import infoModal from "../components/infoModal.vue";
import playerController from "../components/playerController.vue";

import { formatTime, seekFlags } from "../tools";
import { apiInstance } from "../api";
export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const playerData = computed(() => store.state.simpleapi.playerData);
    const connectedState = computed(() => store.state.simpleapi.connected);
    const screenOrientation = computed(() => store.state.app.screenOrientation);
    const serverConfigured = computed(
      () => store.state.settings.settings.configured
    );
    const playerTitle = computed(() => {
      if (connectedState.value) {
        return (
          playerData.value.media_title ||
          playerData.value.filename ||
          "Connected (No playback)"
        );
      } else {
        return "Disconnected";
      }
    });
    const isPlayerActive = computed(() => {
      return store.state.mpvsocket.playerData.filename ? true : false;
    });
    const newFileName = ref("");

    const openURL = (url) => {
      window.open(url, "_system");
    };

    const onFileBrowserClicked = async () => {
      const modal = await modalController.create({
        component: fileBrowserModal,
        componentProps: {
          modalController: modalController,
          action: "play",
        },
      });
      modal.onDidDismiss().then((response) => {
        if (response.data) {
          console.log(`Data from modal: ${JSON.stringify(response.data)}`);
          store.state.mpvsocket.socket.emit("openFile", response.data);
        }
      });
      return modal.present();
    };

    const changeVolume = (action) => {
      // TODO: Handle push & hold button somehow
      switch (action) {
        case "mute":
          // store.state.mpvsocket.socket.emit("setPlayerProp", [
          //   "mute",
          //   !store.state.mpvsocket.playerData.mute,
          // ]);
          console.log("Mute TOOD");
          break;
        case "increase":
          if (playerData.value.volume < 100) {
            apiInstance
              .post(`set_volume/${playerData.value.volume + 5}`)
              .then(() =>
                store.commit("simpleapi/setPlayerDataProperty", {
                  key: "volume",
                  value: playerData.value.volume + 5,
                })
              );
          }
          break;
        case "decrease":
          if (playerData.value.volume > 0) {
            apiInstance
              .post(`set_volume/${playerData.value.volume - 5}`)
              .then(() =>
                store.commit("simpleapi/setPlayerDataProperty", {
                  key: "volume",
                  value: playerData.value.volume - 5,
                })
              );
          }
          break;
      }
    };

    const onOpenURLClicked = async () => {
      const modal = await modalController.create({
        component: openURLModal,
        componentProps: {
          modalController: modalController,
        },
      });

      modal.onDidDismiss().then((response) => {
        if (response.data) {
          const mode = response.data.value.appendToPlaylist
            ? "append-play"
            : "replace";
          apiInstance.post(
            `loadfile/${encodeURIComponent(
              response.data.value.filename
            )}/${mode}`
          );
        }
      });
      return modal.present();
    };

    const onAudioSettingsClicked = async () => {
      const modal = await modalController.create({
        component: audioSettingsModal,
        componentProps: {
          modalController: modalController,
        },
      });

      return modal.present();
    };

    const onSubtitleSettingsClicked = async () => {
      const modal = await modalController.create({
        component: subtitleSettingsModal,
        componentProps: {
          modalController: modalController,
        },
        backdropDismiss: true,
      });

      return modal.present();
    };

    const onFullscreenClicked = () => {
      apiInstance.post("fullscreen");
    };

    const onChaptersClicked = async () => {
      const buttons = playerData.value["chapter-list"].map((chapter) => {
        return {
          role: chapter.time,
          text: `${chapter.title} (${formatTime(chapter.time)})`,
        };
      });

      const actionSheet = await actionSheetController.create({
        header: "Select chapter",
        buttons,
      });

      await actionSheet.present();

      const { role } = await actionSheet.onDidDismiss();

      if (role !== "backdrop") {
        store.state.mpvsocket.socket.emit("seek", {
          seekTo: role,
          flag: seekFlags.ABSOLUTE,
        });
      }
    };

    const onInfoClicked = async () => {
      const modal = await modalController.create({
        component: infoModal,
        componentProps: {
          modalController: modalController,
        },
        backdropDismiss: true,
      });
      return await modal.present();
    };

    return {
      playerData,
      playerTitle,
      newFileName,
      connectedState,
      isPlayerActive,
      route,
      changeVolume,
      serverConfigured,
      volumeHighOutline,
      volumeLowOutline,
      volumeMuteOutline,
      logoYoutube,
      bookOutline,
      folder,
      scanOutline,
      journalOutline,
      modalController,
      onOpenURLClicked,
      onAudioSettingsClicked,
      onFileBrowserClicked,
      onSubtitleSettingsClicked,
      earOutline,
      informationCircle,
      screenOrientation,
      onFullscreenClicked,
      onInfoClicked,
      openURL,
      onChaptersClicked,
    };
  },

  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    playerController,
  },
};
</script>

<style scoped>
.remoteButtons {
  text-align: center;
}

.remoteButtons ion-button {
  margin: 5px;
}

.rotateIcon {
  transform: rotate(90deg);
}

@media (min-width: 576px) and (orientation: landscape) {
  .remoteButtons {
    text-align: left;
  }
  .remoteButtons ion-button {
    margin: 5px;
    width: 50px;
    height: 50px;
  }
}

@media (orientation: portrait) {
  .remoteButtons {
    text-align: center;
  }
  .remoteButtons ion-button {
    margin: 7px;
    width: 60px;
    height: 60px;
  }
}
</style>
