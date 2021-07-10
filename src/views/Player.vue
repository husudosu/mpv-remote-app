<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="#fff"></ion-menu-button>
        </ion-buttons>
        <ion-title>
          {{ playerData.media_title || playerData.filename }}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="serverConfigured">
      <!-- Itt mégegyszer volt toolbar a title-nek !-->
  
      <ion-grid style="height: 100%;">
        <ion-row class="remoteButtons">
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
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
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
            <ion-button @click="onInfoClicked" :disabled="!connectedState">
              <ion-icon slot="icon-only" :icon="informationCircle"></ion-icon>
            </ion-button>
            <ion-button :disabled="!connectedState" @click="onFullscreenClicked">
              <ion-icon slot="icon-only" :icon="scanOutline"></ion-icon>
            </ion-button>
            <ion-button @click="onAudioSettingsClicked" :disabled="!connectedState">
              <ion-icon slot="icon-only" :icon="earOutline"></ion-icon>
            </ion-button>
            <ion-button
              @click="onSubtitleSettingsClicked"
              :disabled="!connectedState"
            >
              <ion-icon class="rotateIcon" slot="icon-only" :icon="journalOutline"></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col :size="screenOrientation.startsWith('landscape') ? 6 : 12">
              <ion-button :disabled="!connectedState" @click="onFileBrowserClicked">
                <ion-icon slot="icon-only" :icon="folder"></ion-icon>
              </ion-button>
              <ion-button :disabled="!connectedState" @click="onOpenURLClicked">
                <ion-icon slot="icon-only" :icon="logoYoutube"></ion-icon>
              </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-content v-else>
      Server not configured yet.
    </ion-content>
    <ion-footer v-if="serverConfigured && isPlayerActive && connectedState">
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
            <ion-col size=12>
              <ion-button @click="onPlayPauseClicked">
                <ion-icon v-if="playerData.pause" slot="icon-only" :icon="playOutline"></ion-icon>
                <ion-icon v-else slot="icon-only" :icon="pauseOutline"></ion-icon>
              </ion-button>
              <ion-button @click="onStopClicked">
                <ion-icon slot="icon-only" :icon="stopOutline"></ion-icon>
              </ion-button>
              <ion-button @click="onPrevClicked">
                <ion-icon slot="icon-only" :icon="playSkipBackOutline"></ion-icon>
              </ion-button>
              <ion-button @click="onNextClicked">
                <ion-icon slot="icon-only" :icon="playSkipForwardOutline"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
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
  logoYoutube, folder, playSkipBackOutline, playSkipForwardOutline,
  scanOutline, journalOutline, earOutline, informationCircle
  } from 'ionicons/icons';
import { socket } from '../socketClient';
import openURLModal from '../components/openURLModal.vue';
import audioSettingsModal from '../components/audioSettingsModal.vue';
import subtitleSettingsModal from '../components/subtitleSettingsModal.vue';
import fileBrowserModal from '../components/fileBrowserModal.vue';
import infoModal from '../components/infoModal.vue';

export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const playerData = computed(() => store.state.mpvsocket.playerData);
    const connectedState = computed(() => store.state.mpvsocket.connected);
    const serverConfigured = computed(() => store.state.settings.configured);

    const screenOrientation = ref(screen.orientation.type);

    const newFileName = ref('');
    const seekTo = ref(0);

    window.addEventListener("orientationchange", function(){
        screenOrientation.value  = screen.orientation.type;
        console.log(screen.orientation.type)
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
            socket.emit("openFile", {filename : response.data, appendToPlaylist: true}); 
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
          },
          backdropDismiss: true
        });

        return modal.present();
    }

    const onPrevClicked = () => {
      socket.emit("playlistPrev");
    }

    const onNextClicked = () => {
      socket.emit("playlistNext");
    }

    const onFullscreenClicked = () => {
      socket.emit("fullscreen");
    }

    const onInfoClicked = async() => {
      const modal = await modalController
        .create({
          component: infoModal,
          componentProps: {
            modalController: modalController
          },
          backdropDismiss: true
        });
        return await modal.present();
    }

    return {
      playerData,
      newFileName,
      connectedState,
      isPlayerActive,
      route,
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
      scanOutline,
      journalOutline,
      modalController,
      onOpenURLClicked,
      onAudioSettingsClicked,
      onFileBrowserClicked,
      onPrevClicked,
      onNextClicked,
      onSubtitleSettingsClicked,
      earOutline,
      informationCircle,
      screenOrientation,
      onFullscreenClicked,
      onInfoClicked
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
  height: 5px;
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

.videoControls ion-button {
  width: 45px;
  height: 45px;
}

.rotateIcon {
  transform: rotate(90deg);
}

@media (min-width: 576px) and (orientation: landscape){
  .remoteButtons {
    text-align: left;
  }
  .remoteButtons ion-button {
    margin: 5px;
    width: 50px;
    height: 50px;
  }
  .playbackTime {
    display: none;
  }
}

@media (orientation: portrait){
  .remoteButtons {
    text-align: center;
  }
  .remoteButtons ion-button {
    margin: 7px;
    width: 60px;
    height: 60px;
  }
}


/*
Seekbar style
*/
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #455795;
  border-radius: 1px;
  border: 0.1px solid #010101;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 18px;
  width: 13px;
  border-radius: 3px;
  background: #26335c;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -7px;
}

input[type=range]:focus::-webkit-slider-runnable-track {
  background: #367ebd;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #455795;
  border-radius: 1px;
  border: 0.1px solid #010101;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 18px;
  width: 13px;
  border-radius: 3px;
  background: #26335c;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #2a6495;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type=range]::-ms-fill-upper {
  background: #3071a9;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type=range]::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
}
input[type=range]:focus::-ms-fill-lower {
  background: #3071a9;
}
input[type=range]:focus::-ms-fill-upper {
  background: #367ebd;
}
</style>