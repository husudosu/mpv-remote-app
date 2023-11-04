<template>
  <ion-page>
    <ion-loading :is-open="loading" message="Loading..."> </ion-loading>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="#fff"></ion-menu-button>
        </ion-buttons>
        <ion-title> Playlist </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-button @click="onClearPlaylistClicked" size="small" style="margin: 10px" :disabled="playlist.length == 0">
        <ion-icon :icon="trashBin"></ion-icon>
      </ion-button>
      <ion-reorder-group @ionItemReorder="doReorder($event)" :disabled="playlist.length <= 1">
        <ion-item lines="full" @click="onItemClicked(item)" v-for="item in playlist" :key="item.id">
          <ion-icon class="playlistItemIndicator" v-if="item.current" slot="start" :icon="play"></ion-icon>
          <ion-label class="ion-text-wrap">
            <p>
              {{
                item.current
                ? playerData["media-title"] || item.filename
                : item.filename
              }}
            </p>
          </ion-label>
          <ion-button @click="onRemoveItemClicked(item)" fill="clear" slot="end">
            <ion-icon style="color: white" slot="icon-only" :icon="trashBin"></ion-icon>
          </ion-button>
          <ion-reorder slot="end"></ion-reorder>
        </ion-item>
      </ion-reorder-group>
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
  IonReorder,
  IonReorderGroup,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonLoading,
  onIonViewDidEnter,
  onIonViewWillLeave
} from "@ionic/vue";

import { play, add, remove, trashBin } from "ionicons/icons";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { apiInstance } from "../api";
export default {
  setup() {
    const store = useStore();
    const playerData = computed(() => store.state.simpleapi.playerData);
    const playlist = computed(() => store.state.simpleapi.playlist);
    const DOUBLE_CLICK_THRESHOLD = 500;
    const loading = ref(false);
    let lastOnStart = 0;

    // TODO: Replace Ion-List with custom solution something like implemented on fileBrowserModal.
    onIonViewDidEnter(async () => {
      // Get initial playlist.
      let loadingTimeout = setTimeout(() => {
        loading.value = true;
      }, 150);
      apiInstance.get("/playlist").then((response) => {
        store.commit("simpleapi/setPlaylist", response.data);
      }).finally(() => {
        clearTimeout(loadingTimeout);
        loading.value = false;
        store.dispatch("simpleapi/setPlaylistRefreshInterval");
      });
    });

    onIonViewWillLeave(() => {
      store.commit("simpleapi/clearPlaylistRefreshInterval");
    });

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
        const index = playlist.value.findIndex(
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
      doReorder,
      onItemClicked,
      onRemoveItemClicked,
      onClearPlaylistClicked,
      playlist,
      loading
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
    IonLoading,
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
