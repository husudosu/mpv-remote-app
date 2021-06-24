<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>
          {{ toolbarTitle }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="serverConfigured">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ toolbarTitle }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid style="height: 100%;">
        <ion-row>
          <ion-col size=12 class="videoControls">
          </ion-col>
        </ion-row>
        <ion-row class="remoteButtons">
          <ion-col>
              <ion-button :disabled="!connectedState" @click="changeVolume('decrease')">
                <ion-icon slot="icon-only" :icon="volumeLowOutline"></ion-icon>
              </ion-button>
              <ion-button :disabled="!connectedState" @click="changeVolume('mute')">
                <ion-icon slot="icon-only" :icon="volumeMuteOutline"></ion-icon>
              </ion-button>
              <ion-button :disabled="!connectedState" @click="changeVolume('increase')">
                <ion-icon slot="icon-only" :icon="volumeHighOutline"></ion-icon>
              </ion-button>
          </ion-col>
        </ion-row>
        <ion-row class="remoteButtons">
            <ion-col>
              <ion-button :disabled="!connectedState" @click="onOpenURLClicked">
                <ion-icon slot="start" :icon="logoYoutube"></ion-icon>
                Open URL
              </ion-button>
          </ion-col>
        </ion-row>
        <ion-row class="remoteButtons">
            <ion-col>
              <ion-button :disabled="!connectedState" @click="onFileBrowserClicked">
                <ion-icon slot="start" :icon="folder"></ion-icon>
                  Browse files
              </ion-button>
          </ion-col>
        </ion-row>

        <ion-row class="remoteButtons">
          <ion-col>

          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-content v-else>
      Server not configured yet.
    </ion-content>
    <ion-footer class="ion-no-border remoteFooter">
        <ion-button @click="onAudioSettingsClicked" :disabled="!connectedState">Audio</ion-button>
        <ion-button @click="onSubtitleSettingsClicked" :disabled="!connectedState">Subtitle</ion-button>
    </ion-footer>
    <ion-footer v-if="serverConfigured">
        <template v-if="isPlayerActive && connectedState">
          <ion-row class="ion-justify-content-end">
            <ion-col size=12 class="videotitle">
              <div class="playbackTime">
                    {{ playerData.playback_time }} / {{ playerData.duration }}
              </div>
              <input 
                id="seekbar"
                type="range"
                name="rng"
                min="0"
                step="1"
                :value="playerData.percent_pos" 
                style="width: 100%;" 
                @input="onSeek"
              >
            </ion-col>
          </ion-row>
          <ion-row class="videoControls">
            <ion-col cols=11>
              <ion-button size="small" @click="onPlayPauseClicked">
                <ion-icon size="small" v-if="playerData.pause" slot="icon-only" :icon="playOutline"></ion-icon>
                <ion-icon size="small" v-else slot="icon-only" :icon="pauseOutline"></ion-icon>
              </ion-button>
              <ion-button size="small" @click="onStopClicked">
                <ion-icon size="small" slot="icon-only" :icon="stopOutline"></ion-icon>
              </ion-button>
              <ion-button size="small" @click="onPrevClicked">
                <ion-icon size="small" slot="icon-only" :icon="playSkipBackOutline"></ion-icon>
              </ion-button>
              <ion-button size="small" @click="onNextClicked">
                <ion-icon size="small" slot="icon-only" :icon="playSkipForwardOutline"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
        </template>
        <template v-else>
          <div class="playbackTimeInactive">No playback</div>
        </template>

    </ion-footer>
  </ion-page>
</template>

<script>
import {
  IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonFooter,
  modalController,
} from '@ionic/vue';

import {computed, ref} from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { 
  playOutline, pauseOutline, stopOutline,
  volumeHighOutline, volumeLowOutline, volumeMuteOutline,
  logoYoutube, folder, playSkipBackOutline, playSkipForwardOutline
  } from 'ionicons/icons';
import { socket } from '../socketClient';
import openURLModal from '../components/openURLModal.vue';
import audioSettingsModal from '../components/audioSettingsModal.vue';
import subtitleSettingsModal from '../components/subtitleSettingsModal.vue';
import fileBrowserModal from '../components/fileBrowserModal.vue';

export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const playerData = computed(() => store.state.mpvsocket.playerData);
    const connectedState = computed(() => store.state.mpvsocket.connected);
    const serverConfigured = computed(() => store.state.settings.configured);
    const newFileName = ref('');
    const seekTo = ref(0);
    // Connect if needed.
    // if (store.state.settings.configured && !store.state.mpvsocket.connected){
    //   connect();
    // }
    const toolbarTitle = computed(() => {
      if (connectedState.value){
        return store.state.mpvsocket.playerData.media_title || store.state.mpvsocket.playerData.filename || "Player";
      }
      return "Disconnected from MPV";
    });

    const isPlayerActive = computed(() => {
      return store.state.mpvsocket.playerData.filename ? true : false;
    });
  
    const onPlayPauseClicked = () => {
      console.log(`Pause clicked. Current value: ${store.state.mpvsocket.playerData.pause}`);
      socket.emit('setPlayerProp', ["pause", !store.state.mpvsocket.playerData.pause]);
    };

    const onStopClicked = () => {
      socket.emit('stopPlayback');
    };

    const onChangeFileClicked = () => {
      console.log("Change file clicked");
      socket.emit('openFile', newFileName.value);
    };

    const onFileBrowserClicked = async() => {
      const modal = await modalController
        .create({
          component: fileBrowserModal,
          componentProps: {
            modalController: modalController
          }
        })
        modal.onDidDismiss()
        .then((response) => {
          if (response.data){
            console.log(`Data from modal: ${JSON.stringify(response.data)}`);
            socket.emit("openFile", {filename : response.data, appendToPlaylist: false}); 
          }
        })
      return modal.present();
    };

    const onSeek = (e) => {
      socket.emit('seek', e.target.value);
    };

    const changeVolume = (action) => {
      // TODO: Handle push & hold button somehow
      switch (action){
        case 'mute':
          socket.emit("setPlayerProp", ["mute", !store.state.mpvsocket.playerData.mute]);
          break;
        case 'increase':
          if (playerData.value.volume < 100){
            socket.emit("setPlayerProp", ["volume", store.state.mpvsocket.playerData.volume + 5]);
          }
          break;
        case 'decrease':
          if (playerData.value.volume > 0){
            socket.emit("setPlayerProp", ["volume", store.state.mpvsocket.playerData.volume - 5]);
          }
          break;
      }
    }

    const onOpenURLClicked = async() => {
      const modal = await modalController
        .create({
          component: openURLModal,
          componentProps: {
            modalController: modalController
          }
        });

        modal.onDidDismiss()
          .then((response) => {
            if (response.data){
              console.log(`Data from modal: ${JSON.stringify(response.data.value)}`);
              socket.emit("openFile", response.data.value); 
            }
          })
        return modal.present();
    }

    const onAudioSettingsClicked = async() => {
      const modal = await modalController
        .create({
          component: audioSettingsModal,
          componentProps: {
            modalController: modalController
          }
        });

        return modal.present();
    }

    const onSubtitleSettingsClicked = async() => {
      const modal = await modalController
        .create({
          component: subtitleSettingsModal,
          componentProps: {
            modalController: modalController
          }
        });

        return modal.present();
    }

    const onPrevClicked = () => {
      socket.emit("playlistPrev");
    }

    const onNextClicked = () => {
      socket.emit("playlistNext");
    }


    return {
      playerData,
      newFileName,
      connectedState,
      isPlayerActive,
      route,
      toolbarTitle,
      onPlayPauseClicked,
      onChangeFileClicked,
      onStopClicked,
      onSeek,
      seekTo,
      changeVolume,
      serverConfigured,
      playOutline,
      pauseOutline,
      stopOutline,
      volumeHighOutline,
      volumeLowOutline,
      volumeMuteOutline,
      logoYoutube,
      folder,
      playSkipBackOutline,
      playSkipForwardOutline,
      modalController,
      onOpenURLClicked,
      onAudioSettingsClicked,
      onFileBrowserClicked,
      onPrevClicked,
      onNextClicked,
      onSubtitleSettingsClicked
    } 
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
    IonFooter,
  }
}
</script>

<style scoped>

.videotitle {
  padding: 10px;
}

.videoControls ion-col {
  margin: 5px;
  margin-right: 1px;
}

#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}

.playbackTime {
  text-align: center;
  align-content: center;
}

.playbackTimeInactive {
  text-align: center;
  padding: 20px;
}

#seekbar {
  width: 100%;
  background-color: red;
}

.remoteButtons {
  text-align: center;
}

.remoteButtons ion-button {
  margin: 5px;
}

.remoteFooter {
  border: 0px;
  padding: 5px 5px 10px 10px;
  text-align: right;
}

.remoteFooter ion-button {
  margin: 5px;
  width: 100px;
}

.codecInfo {
  text-align: right;
  padding-top: 15px;
}
</style>