<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ toolbarTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ toolbarTitle }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-row>
          <ion-col size=12 class="videoControls">
            <ion-button shape="round" @click="onPlayPauseClicked">
              <ion-icon v-if="playerData.pause" slot="icon-only" :icon="playOutline"></ion-icon>
              <ion-icon v-else slot="icon-only" :icon="pauseOutline"></ion-icon>
            </ion-button>
            <ion-button shape="round" @click="onStopClicked">
              <ion-icon slot="icon-only" :icon="stopOutline"></ion-icon>
            </ion-button>

          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col cols=11>
            <ion-input v-model="newFileName" placeholder="File/URL"></ion-input>
          </ion-col>
          <ion-col cols=1>
            <ion-button @click="onChangeFileClicked">Open</ion-button>
          </ion-col>
        </ion-row>


      </ion-grid>
    </ion-content>
    <ion-footer>
        <ion-row class="ion-justify-content-end">
          <ion-col size=12 class="videotitle">
            <div class="playbackTime">{{ playerData.playback_time }} / {{ playerData.duration }}</div>
            <input id="seekbar" type="range" name="rng" min="0" step="1" :value="playerData.percent_pos" style="width: 100%;" @input="onSeek">
          </ion-col>
        </ion-row>
    </ion-footer>
  </ion-page>
</template>

<script>
import {
  IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonInput, IonFooter
} from '@ionic/vue';
import {computed, ref} from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { playOutline, pauseOutline, stopOutline } from 'ionicons/icons';
import { socket } from '../main'


export default {
  setup() {
    const store = useStore()
    const route = useRoute()
    const playerData = computed(() => store.state.mpvsocket.playerData)
    const connectedState = computed(() => store.state.mpvsocket.connected)
    const newFileName = ref('')
    const seekTo = ref(0)

    const toolbarTitle = computed(() => {
      return store.state.mpvsocket.playerData.media_title || store.state.mpvsocket.playerData.filename || "Player"
    })

    const onPlayPauseClicked = () => {
      console.log(`Pause clicked. Current value: ${store.state.mpvsocket.playerData.pause}`)
      socket.emit('set_player_prop', ["pause", !store.state.mpvsocket.playerData.pause])
    }

    const onStopClicked = () => {
      socket.emit('stopPlayback')
    }

    const onChangeFileClicked = () => {
      console.log("Change file clicked")
      socket.emit('openFile', newFileName.value)
    }

    const onSeek = (e) => {
      socket.emit('seek', e.target.value)
    }

    return {
      playerData,
      newFileName,
      connectedState,
      route,
      toolbarTitle,
      playOutline,
      pauseOutline,
      stopOutline,
      onPlayPauseClicked,
      onChangeFileClicked,
      onStopClicked,
      onSeek,
      seekTo
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
    IonInput,
    IonFooter
  }
}
</script>

<style scoped>

.videotitle {
  padding: 10px;
}

.videoControls {
  margin: 10px;
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

#seekbar {
  width: 100%;
  padding-left: 15px;
  padding-right: 15px;
  background-color: red;
}
</style>