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
        <div class="row" v-for="item in playlist" :key="item.id" @click="onItemClicked(item)">
          <div class="columnIcon">
            <ion-icon class="playlistItemIndicator" v-if="item.current" slot="start" :icon="play"></ion-icon>
          </div>
          <div class="column">
            {{
              item.current
              ? playerData["media-title"] || item.filename
              : item.filename
            }}
          </div>
          <ion-button @click="onRemoveItemClicked(item)" fill="clear" slot="end">
            <ion-icon style="color: white" slot="icon-only" :icon="trashBin"></ion-icon>
          </ion-button>
          <ion-reorder slot="end"></ion-reorder>
        </div>
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
    onIonViewDidEnter(() => {
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
    // TODO: If the user dragging playlist item stop refreshing of the playlist.

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

.row {
  display: flex;
  background-color: #172246;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 15px;
  border-bottom: 1px solid rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.3);
}

.columnIcon {
  padding-left: 17px;
  padding-right: 30px;
  flex: 10%;
  min-width: 50px;
  font-size: 25px;
  color: rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54);
}

.column {
  flex: 90%;
  min-width: 0px;
  padding-right: 10px;
}

.fileBrowserPath {
  padding-top: 0px;
  margin-top: 0px;
  height: 40px;
}
</style>
