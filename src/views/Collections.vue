<template>
  <ion-page>
    <ion-loading :is-open="loading" message="Loading..."></ion-loading>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onBackClicked">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
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
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" @click="onAddNewCollectionClicked">
        <ion-fab-button color="success">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <ion-list>
        <ion-item lines="full" v-for="collection in collections" :key="collection.id" button
          @click="onEditCollectionClicked(collection)">
          <ion-label class="ion-text-wrap">
            <h2>{{ collection.name }}</h2>
            <p>{{ getCollectionType(collection.type) }}</p>
          </ion-label>
        </ion-item>
        <ion-item lines="full" v-if="collections.length == 0">
          I'm empty
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref, computed } from "vue";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonFab,
  IonFabButton,
  IonButton,
  IonLoading,
  modalController,
} from "@ionic/vue";
import { add, trashBin, options, arrowBack } from "ionicons/icons";
import { apiInstance } from "../api";
import { useStore } from "vuex";
import addCollectionModal from "../components/addCollectionModal.vue";

export default {
  setup() {
    const collections = ref([]);
    const store = useStore();
    const connectedState = computed(() => store.state.simpleapi.connected);
    const loading = ref(false);

    let loadingTimeout = setTimeout(() => {
      loading.value = true;
    }, 150);

    apiInstance
      .get("collections")
      .then((response) => (collections.value = response.data))
      .finally(() => {
        clearTimeout(loadingTimeout);
        loading.value = false;
      });

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
            .then((response) => collections.value.push(response.data));
        }
      });
      return await modal.present();
    };

    const onEditCollectionClicked = async (item) => {
      // Load full collection object  before presenting modal.
      let fullCollection = null;
      await apiInstance
        .get(`collections/${item.id}`)
        .then((response) => (fullCollection = response.data));
      const modal = await modalController.create({
        component: addCollectionModal,
        componentProps: {
          modalController: modalController,
          collection: fullCollection,
        },
      });

      modal.onDidDismiss().then((response) => {
        if (response.data && !response.data.deleted) {
          apiInstance
            .patch(`/collections/${response.data.id}`, response.data)
            .then((response) => {
              Object.assign(
                collections.value[collections.value.indexOf(item)],
                response.data
              );
            });
        } else if (response.data && response.data.deleted) {
          apiInstance.delete(`/collections/${response.data.id}`).then(() => {
            collections.value.splice(collections.value.indexOf(item), 1);
            store.dispatch("settings/cleanFilemanHistory");
          });
        }
      });
      await modal.present();
    };

    const onBackClicked = () => {
      modalController.dismiss();
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
      getCollectionType,
      onEditCollectionClicked,
      onBackClicked,
      connectedState,
      collections,
      add,
      trashBin,
      options,
      arrowBack,
      loading,
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
    IonIcon,
    IonLabel,
    IonFab,
    IonFabButton,
    IonButton,
    IonLoading,
  },
};
</script>
