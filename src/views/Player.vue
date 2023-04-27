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
    <ion-content :fullscreen="true" v-if="configured">
      <ion-grid style="height: 100%">
        <ion-row class="remoteButtons">
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button :disabled="!connectionState || !playerData.filename" @click="changeVolume('decrease')">
              <ion-icon slot="icon-only" :icon="volumeLowOutline"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState || !playerData.filename" @click="changeVolume('mute')">
              <ion-icon slot="icon-only" :icon="volumeMuteOutline"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState || !playerData.filename" @click="changeVolume('increase')">
              <ion-icon slot="icon-only" :icon="volumeHighOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button :disabled="!connectionState || !playerData.filename" @click="onInfoClicked">
              <ion-icon slot="icon-only" :icon="informationCircle"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState || !playerData.filename" @click="onFullscreenClicked">
              <ion-icon slot="icon-only" :icon="scanOutline"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState || !playerData.filename" @click="onAudioSettingsClicked">
              <ion-icon slot="icon-only" :icon="earOutline"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState || !playerData.filename" @click="onSubtitleSettingsClicked">
              <ion-icon class="rotateIcon" slot="icon-only" :icon="journalOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button :disabled="!connectionState || !filebrowserEnabled" @click="onFileBrowserClicked">
              <ion-icon slot="icon-only" :icon="folder"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState" @click="onOpenURLClicked">
              <ion-icon slot="icon-only" :icon="logoYoutube"></ion-icon>
            </ion-button>
            <ion-button :disabled="playerData['chapter-list'].length == 0" @click="onChaptersClicked">
              <ion-icon slot="icon-only" :icon="bookOutline"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectionState" @click="onShutdownClicked">
              <ion-icon slot="icon-only" :icon="power"></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-content v-else>
      <ion-grid>
        <ion-row>
          <ion-col>Server not configued yet.
            <p>
              If you need help
              <a @click="openURL('https://github.com/husudosu/mpv-remote-app')">check tutorial here</a>
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <playerController v-if="configured && playerData.filename"></playerController>
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

import { computed } from "vue";
import { useStore } from "vuex";
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
  power,
} from "ionicons/icons";

import openURLModal from "../components/openURLModal.vue";
import audioSettingsModal from "../components/audioSettingsModal.vue";
import subtitleSettingsModal from "../components/subtitleSettingsModal.vue";
import fileBrowserModal from "../components/fileBrowserModal.vue";
import infoModal from "../components/infoModal.vue";
import playerController from "../components/playerController.vue";

import { formatTime, seekFlags, openURL, loadFileFlags } from "../tools";
import { apiInstance } from "../api";
import { FileBrowserActions } from "../enums";
export default {
  setup() {
    const store = useStore();
    const screenOrientation = computed(() => store.state.app.screenOrientation);
    const playerData = computed(() => store.getters["simpleapi/playerData"]);
    const onFileBrowserClicked = async () => {
      const modal = await modalController.create({
        component: fileBrowserModal,
        componentProps: {
          action: FileBrowserActions.PLAY,
        },
      });
      modal.onDidDismiss().then((response) => {
        if (response.data) {
          console.log(`Data from modal: ${JSON.stringify(response.data)}`);
          const mode = response.data.appendToPlaylist
            ? loadFileFlags.APPEND_PLAY
            : loadFileFlags.REPLACE;
          apiInstance.post("playlist", {
            filename: response.data.filename,
            flag: mode,
            seekTo: response.data.seekTo,
          });
        }
      });
      return modal.present();
    };

    const changeVolume = (action) => {
      // TODO: Handle push & hold button somehow
      switch (action) {
        case "mute":
          apiInstance.post("controls/mute").then(() => {
            store.commit("simpleapi/setPlayerDataProperty", {
              key: "mute",
              value: !playerData.value.mute,
            });
          });
          break;
        case "increase":
          if (playerData.value.volume < playerData.value["volume-max"]) {
            const newVolume = Math.min(
              playerData.value["volume-max"],
              playerData.value.volume + 5
            );
            apiInstance.post(`controls/volume/${newVolume}`).then(() =>
              store.commit("simpleapi/setPlayerDataProperty", {
                key: "volume",
                value: playerData.value.volume + 5,
              })
            );
          }
          break;
        case "decrease":
          console.log(playerData.value.volume);
          if (playerData.value.volume > 0) {
            const newVolume = Math.max(0, playerData.value.volume - 5);
            apiInstance.post(`controls/volume/${newVolume}`).then(() =>
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
          apiInstance.post("playlist", response.data);
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
      apiInstance.post("controls/fullscreen");
    };

    const onChaptersClicked = async () => {
      const currentChapter = playerData.value["current-chapter"] || playerData.value["chapter"];
      const buttons = playerData.value["chapter-list"].map((chapter, index) => {
        return {
          role: chapter.time,
          text: `${chapter.title} (${formatTime(chapter.time)})`,
          cssClass: currentChapter === index ? "actionSheetCurrentChapter" : ""
        };
      });

      const actionSheet = await actionSheetController.create({
        header: "Select chapter",
        buttons,
      });

      await actionSheet.present();

      const { role } = await actionSheet.onDidDismiss();

      if (role !== "backdrop") {
        apiInstance.post("/controls/seek", {
          target: role,
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

    const onShutdownClicked = async () => {
      const actionSheet = await actionSheetController.create({
        header: "Computer actions",
        buttons: [
          {
            role: "shutdown",
            text: "Shutdown",
          },
          {
            role: "reboot",
            text: "Reboot",
          },
          {
            role: "quit",
            text: "Quit",
          },
        ],
      });

      await actionSheet.present();

      const { role } = await actionSheet.onDidDismiss();

      if (role != "backdrop") {
        apiInstance.post(`/computer/${role}`);
      }
    };

    return {
      playerData,
      playerTitle: computed(() => store.getters["simpleapi/playerTitle"]),
      connectionState: computed(
        () => store.getters["simpleapi/connectionState"]
      ),
      filebrowserEnabled: computed(
        () => store.getters["simpleapi/fileBrowserEnabled"]
      ),
      configured: computed(() => store.getters["settings/configured"]),
      changeVolume,
      volumeHighOutline,
      volumeLowOutline,
      volumeMuteOutline,
      logoYoutube,
      bookOutline,
      folder,
      power,
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
      onShutdownClicked,
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
