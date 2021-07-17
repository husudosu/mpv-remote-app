<template>
  <ion-footer>
    <ion-row class="ion-justify-content-end">
      <ion-col size="12" class="videotitle">
        <div class="playbackTime">
          {{ playerData.playback_time }} /
          {{ playerData.duration }}
        </div>
        <input
          id="seekbar"
          type="range"
          name="rng"
          min="0"
          step="1"
          :value="playerData.percent_pos"
          @input="onSeek"
        />
      </ion-col>
    </ion-row>
    <ion-row class="videoControls">
      <ion-col size="12">
        <ion-button @click="onPlayPauseClicked" fill="clear">
          <ion-icon
            v-if="playerData.pause"
            slot="icon-only"
            :icon="playOutline"
          ></ion-icon>
          <ion-icon v-else slot="icon-only" :icon="pauseOutline"></ion-icon>
        </ion-button>
        <ion-button @click="onStopClicked" fill="clear">
          <ion-icon slot="icon-only" :icon="stopOutline"></ion-icon>
        </ion-button>
        <ion-button @click="onPrevClicked" fill="clear">
          <ion-icon slot="icon-only" :icon="playSkipBackOutline"></ion-icon>
        </ion-button>
        <ion-button @click="onNextClicked" fill="clear">
          <ion-icon slot="icon-only" :icon="playSkipForwardOutline"></ion-icon>
        </ion-button>
      </ion-col>
    </ion-row>
  </ion-footer>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { socket } from "../socketClient";

import { IonFooter, IonRow, IonCol, IonIcon, IonButton } from "@ionic/vue";
import {
  playOutline,
  pauseOutline,
  stopOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
} from "ionicons/icons";
export default {
  setup() {
    const store = useStore();
    const playerData = computed(() => store.state.mpvsocket.playerData);
    const connectedState = computed(() => store.state.mpvsocket.connected);
    const serverConfigured = computed(() => store.state.settings.configured);
    const isPlayerActive = computed(() => {
      return store.state.mpvsocket.playerData.filename ? true : false;
    });

    const onPlayPauseClicked = () => {
      console.log(
        `Pause clicked. Current value: ${store.state.mpvsocket.playerData.pause}`
      );
      socket.emit("setPlayerProp", [
        "pause",
        !store.state.mpvsocket.playerData.pause,
      ]);
    };

    const onSeek = (e) => {
      socket.emit("seek", e.target.value);
    };

    const onStopClicked = () => {
      socket.emit("stopPlayback");
    };

    const onPrevClicked = () => {
      socket.emit("playlistPrev");
    };

    const onNextClicked = () => {
      socket.emit("playlistNext");
    };

    return {
      playerData,
      connectedState,
      serverConfigured,
      isPlayerActive,
      onPlayPauseClicked,
      onStopClicked,
      onPrevClicked,
      onNextClicked,
      onSeek,
      playOutline,
      pauseOutline,
      stopOutline,
      playSkipBackOutline,
      playSkipForwardOutline,
    };
  },
  components: {
    IonFooter,
    IonRow,
    IonCol,
    IonIcon,
    IonButton,
  },
};
</script>

<style scoped>
.videoControls ion-col {
  margin-right: 1px;
}
.videoControls ion-button {
  color: #fff;
  font-size: 10px;
}

.videotitle {
  padding: 10px;
}

.playbackTime {
  text-align: center;
  align-content: center;
}

#seekbar {
  width: 100%;
  height: 5px;
}

/*
Seekbar style
*/
input[type="range"] {
  -webkit-appearance: none;
  width: 80%;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #455795;
  border-radius: 1px;
  border: 0.1px solid #010101;
}
input[type="range"]::-webkit-slider-thumb {
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

input[type="range"]:focus::-webkit-slider-runnable-track {
  background: #367ebd;
}
input[type="range"]::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: #455795;
  border-radius: 1px;
  border: 0.1px solid #010101;
}
input[type="range"]::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 18px;
  width: 13px;
  border-radius: 3px;
  background: #26335c;
  cursor: pointer;
}
input[type="range"]::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}
input[type="range"]::-ms-fill-lower {
  background: #2a6495;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type="range"]::-ms-fill-upper {
  background: #3071a9;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type="range"]::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: #26335c;
  cursor: pointer;
}
input[type="range"]:focus::-ms-fill-lower {
  background: #3071a9;
}
input[type="range"]:focus::-ms-fill-upper {
  background: #367ebd;
}

@media (min-width: 576px) and (orientation: landscape) {
  .playbackTime {
    display: none;
  }
}
</style>
