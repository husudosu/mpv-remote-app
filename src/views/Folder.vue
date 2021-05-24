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
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size=12 class="videotitle">
            {{ playerData.time }}s
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonIcon} from '@ionic/vue';
import {computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { playOutline, pauseOutline } from 'ionicons/icons';
import { socket } from '../main'

export default {
  setup() {
    const store = useStore()
    const route = useRoute()
    const playerData = computed(() => store.state.mpvsocket.playerData)
    const connectedState = computed(() => store.state.mpvsocket.connected)
  
    const toolbarTitle = computed(() => {
      return playerData.value.playback || 'Player'
    })

    const onPlayPauseClicked = () => {
      socket.emit('set_player_prop', {'property': 'pause', value: !playerData.value.pause})
    }

    return {
      playerData,
      connectedState,
      route,
      toolbarTitle,
      playOutline,
      pauseOutline,
      onPlayPauseClicked
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
    IonIcon
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
</style>