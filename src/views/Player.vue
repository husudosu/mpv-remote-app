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
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="changeVolume('decrease')"
            >
              <ion-icon slot="icon-only" :icon="volumeLowOutline"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="changeVolume('mute')"
            >
              <ion-icon slot="icon-only" :icon="volumeMuteOutline"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="changeVolume('increase')"
            >
              <ion-icon slot="icon-only" :icon="volumeHighOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="onInfoClicked"
            >
              <ion-icon slot="icon-only" :icon="informationCircle"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="onFullscreenClicked"
            >
              <ion-icon slot="icon-only" :icon="scanOutline"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="onAudioSettingsClicked"
            >
              <ion-icon slot="icon-only" :icon="earOutline"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="!connectedState || !playerData.filename"
              @click="onSubtitleSettingsClicked"
            >
              <ion-icon
                class="rotateIcon"
                slot="icon-only"
                :icon="journalOutline"
              ></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button
              :disabled="!connectedState"
              @click="onFileBrowserClicked"
            >
              <ion-icon slot="icon-only" :icon="folder"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectedState" @click="onOpenURLClicked">
              <ion-icon slot="icon-only" :icon="logoYoutube"></ion-icon>
            </ion-button>
            <ion-button
              :disabled="playerData['chapter-list'].length == 0"
              @click="onChaptersClicked"
            >
              <ion-icon slot="icon-only" :icon="bookOutline"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectedState" @click="onShutdownClicked">
              <ion-icon slot="icon-only" :icon="power"></ion-icon>
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
    <playerController
      v-if="serverConfigured && playerData.filename"
    ></playerController>
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
  power,
} from "ionicons/icons";

import openURLModal from "../components/openURLModal.vue";
import audioSettingsModal from "../components/audioSettingsModal.vue";
import subtitleSettingsModal from "../components/subtitleSettingsModal.vue";
import fileBrowserModal from "../components/fileBrowserModal.vue";
import infoModal from "../components/infoModal.vue";
import playerController from "../components/playerController.vue";

import { formatTime, seekFlags, openURL } from "../tools";
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
          playerData.value["media-title"] ||
          playerData.value.filename ||
          "Connected (No playback)"
        );
      } else {
        return "Disconnected";
      }
    });

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
          const mode = response.data.appendToPlaylist
            ? "append-play"
            : "replace";
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
          if (playerData.value.volume < 100) {
            apiInstance
              .post(`controls/volume/${playerData.value.volume + 5}`)
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
              .post(`controls/volume/${playerData.value.volume - 5}`)
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
          apiInstance.post("playlist", {
            filename: response.data.value.filename,
            flag: mode,
          });
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
      playerTitle,
      connectedState,
      route,
      changeVolume,
      serverConfigured,
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
