<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="#fff"></ion-menu-button>
        </ion-buttons>
        <ion-title> Playlist </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-button
        @click="onClearPlaylistClicked"
        size="small"
        style="margin: 10px"
        :disabled="playerData.playlist.length == 0"
      >
        <ion-icon :icon="trashBin"></ion-icon>
      </ion-button>
      <ion-reorder-group
        @ionItemReorder="doReorder($event)"
        :disabled="playerData.playlist.length <= 1"
      >
        <ion-item
          @click="onItemClicked(item)"
          v-for="item in playerData.playlist"
          :key="item.id"
        >
          <ion-icon
            class="playlistItemIndicator"
            v-if="item.current"
            slot="start"
            :icon="play"
          ></ion-icon>
          <ion-label class="ion-text-wrap">
            <p>
              {{
                item.current
                  ? playerData["media-title"] || item.filename
                  : item.filename
              }}
            </p>
          </ion-label>
          <ion-button
            @click="onRemoveItemClicked(item)"
            fill="clear"
            slot="end"
          >
            <ion-icon slot="icon-only" :icon="trashBin"></ion-icon>
          </ion-button>
          <ion-reorder slot="end"></ion-reorder>
        </ion-item>
      </ion-reorder-group>
    </ion-content>
    <playerController
      v-if="serverConfigured && isPlayerActive && connectedState"
    ></playerController>
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
  IonReorder,
  IonReorderGroup,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
} from "@ionic/vue";

import { play, add, remove, trashBin } from "ionicons/icons";
import { computed } from "vue";
import { useStore } from "vuex";
import playerController from "../components/playerController.vue";
import { apiInstance } from "../api";
export default {
  setup() {
    const store = useStore();
    const connectedState = computed(() => store.state.simpleapi.connected);
    const serverConfigured = computed(
      () => store.state.settings.settings.configured
    );
    const playerData = computed(() => store.state.simpleapi.playerData);
    const isPlayerActive = computed(() => {
      return store.state.simpleapi.playerData.filename ? true : false;
    });
    const DOUBLE_CLICK_THRESHOLD = 500;
    let lastOnStart = 0;

    const doReorder = async (event) => {
      let fromIndex = event.detail.from;
      let toIndex = event.detail.to;
      // We moving element down.
      if (toIndex > fromIndex) {
        toIndex += 2;
      }
      apiInstance
        .post("playlist/move", null, { params: { fromIndex, toIndex } })
        .then(() => {
          event.detail.complete(true);
        })
        .catch(() => event.detail.complete(false));
    };

    const onClearPlaylistClicked = () => {
      apiInstance.post("/playlist/clear");
    };

    const onRemoveItemClicked = (item) => {
      apiInstance.post(`/playlist/remove/${item.index}`);
    };

    const onItemClicked = (item) => {
      /* TODO: Create double tap gesture somehow for ion-item.
        https://ionicframework.com/docs/utilities/gestures
        I'm using my own shitty solution for this, because dunno how to add all ion-item elements to gesture.
        But it works :-)*/
      const now = Date.now();

      if (Math.abs(now - lastOnStart) <= DOUBLE_CLICK_THRESHOLD) {
        const index = playerData.value.playlist.findIndex(
          (el) => el.id == item.id
        );

        if (index > -1) {
          apiInstance.post(`/playlist/play/${index}`);
        }
        lastOnStart = 0;
      } else {
        lastOnStart = now;
      }
    };

    return {
      playerData,
      play,
      add,
      remove,
      trashBin,
      connectedState,
      serverConfigured,
      isPlayerActive,
      doReorder,
      onItemClicked,
      onRemoveItemClicked,
      onClearPlaylistClicked,
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
    IonReorder,
    IonReorderGroup,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    playerController,
  },
};
</script>

<style scoped>
.playlistItemIndicator {
  width: 16px;
  height: 16px;
  margin-right: 5px;
  color: green;
}
</style>
