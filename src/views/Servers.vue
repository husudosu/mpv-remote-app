<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onBackClicked">
            <ion-icon :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Servers</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Servers</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        @click="addNewserver"
      >
        <ion-fab-button color="success">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-list>
        <ion-item
          v-for="(item, i) in servers"
          :key="i"
          @click="onUpdateServerClicked(item)"
        >
          <ion-label class="ion-text-wrap">
            <h2>{{ item.name }}</h2>
            <p>{{ item.host }}:{{ item.port }}</p>
          </ion-label>
        </ion-item>
        <ion-item v-if="servers.length == 0"> I'm empty </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed } from "vue";

import { useStore } from "vuex";
import { add, arrowBack } from "ionicons/icons";
import {
  IonPage,
  IonToolbar,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonFab,
  IonFabButton,
  modalController,
} from "@ionic/vue";

import addServerModal from "../components/addServerModal.vue";

export default {
  components: {
    IonPage,
    IonToolbar,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonFab,
    IonFabButton,
  },

  setup() {
    const store = useStore();
    const servers = computed(() => store.getters["settings/servers"]);

    // Load servers from store
    const addNewserver = async () => {
      const modal = await modalController.create({
        component: addServerModal,
        componentProps: {
          modalController,
        },
      });
      modal.onDidDismiss().then(async (response) => {
        if (response.data)
          await store.dispatch("settings/addServer", response.data);
      });
      await modal.present();
    };

    const onUpdateServerClicked = async (server) => {
      const modal = await modalController.create({
        component: addServerModal,
        componentProps: {
          modalController,
          server,
        },
      });
      modal.onDidDismiss().then(async (response) => {
        if (response.data) {
          if (response.data.delete)
            await store.dispatch("settings/removeServer", server.id);
          else await store.dispatch("settings/updateServer", response.data);
        }
      });
      await modal.present();
    };

    const onBackClicked = () => {
      modalController.dismiss();
    };

    return {
      servers,
      addNewserver,
      onUpdateServerClicked,
      onBackClicked,
      add,
      arrowBack,
    };
  },
};
</script>
