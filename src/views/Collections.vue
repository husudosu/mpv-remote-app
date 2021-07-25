<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Media collections</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Media collections</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-button
        @click="onAddNewCollectionClicked"
        fill="clear"
        color="success"
      >
        <ion-icon slot="start" :icon="addOutline"></ion-icon>
        Add collection
      </ion-button>
      <ion-list>
        <ion-item v-for="collection in collections" :key="collection.id">
          <ion-label class="ion-text-wrap">
            <h2>{{ collection.name }}</h2>
            <p>{{ getCollectionType(collection.type) }}</p>
          </ion-label>
          <ion-button @click="onDeleteCollectionClicked(collection)">
            <ion-icon slot="icon-only" :icon="trashBin"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from "vue";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonBackButton,
  IonButton,
  IonIcon,
  IonLabel,
  modalController,
} from "@ionic/vue";
import { addOutline, trashBin } from "ionicons/icons";

import { useStore } from "vuex";
import axios from "axios";

import addCollectionModal from "../components/addCollectionModal.vue";

export default {
  setup() {
    const store = useStore();
    const collections = ref([]);
    const apiInstance = axios.create({
      baseURL: `http://${store.state.settings.settings.server.server_ip}:${store.state.settings.settings.server.server_port}`,
      timeout: 10000,
    });

    apiInstance
      .get("/collections")
      .then((response) => (collections.value = response.data));

    const onAddNewCollectionClicked = async () => {
      const modal = await modalController.create({
        component: addCollectionModal,
        componentProps: {
          modalController: modalController,
        },
      });
      modal.onDidDismiss().then((response) => {
        if (response.data) {
          apiInstance
            .post(`/collections/`, response.data)
            .then((response) => collections.value.push(response.data))
            .catch((err) => console.log(err));
        }
      });
      return await modal.present();
    };

    const onDeleteCollectionClicked = async (item) => {
      if (confirm(`Delete collection: ${item.name}?`)) {
        apiInstance.delete(`/collections/${item.id}`).then(() => {
          collections.value.splice(collections.value.indexOf(item), 1);
        });
      }
    };

    const getCollectionType = (value) => {
      switch (value) {
        case 1:
          return "Movies";
        case 2:
          return "TVShows";
        case 3:
          return "Music";
        default:
          return "Unknown";
      }
    };
    return {
      onAddNewCollectionClicked,
      onDeleteCollectionClicked,
      getCollectionType,
      collections,
      addOutline,
      trashBin,
    };
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonBackButton,
    IonButton,
    IonIcon,
    IonLabel,
  },
};
</script>
