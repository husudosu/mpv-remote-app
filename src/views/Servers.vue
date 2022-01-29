<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
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
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed } from "vue";

import { useStore } from "vuex";
import { add } from "ionicons/icons";
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
  IonBackButton,
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
    IonBackButton,
    IonLabel,
    IonFab,
    IonFabButton,
  },

  setup() {
    // Capacitor SQLite and Jeep init
    // const app = getCurrentInstance();
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
        if (response.data) {
          // servers.value.push(response.data);
          await store.dispatch("settings/addServer", response.data);
        }
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
          // Deletes server
          if (response.data.delete) {
            console.log("Delete server");
            await store.dispatch("settings/removeServer", server.id);
          } else {
            console.log("Update server");
          }
        }
      });
      await modal.present();
    };
    // const onUpdateServerClicked = async (server) => {
    //   const modal = await modalController.create({
    //     component: addServerModal,
    //     componentProps: {
    //       modalController,
    //       server,
    //     },
    //   });
    //   modal.onDidDismiss().then(async (response) => {
    //     if (response.data) {
    //       const index = servers.value.findIndex((el) => el.id === server.id);

    //       if (!response.data.delete) {
    //         await updateServer(db.value, server.id, response.data);
    //         servers.value[index] = Object.assign(
    //           servers.value[index],
    //           response.data
    //         );
    //       }
    //     }
    //   }
    // }
    //       // Update server
    //       // if (!response.data.delete) {
    //       //   servers.value[index] = Object.assign(
    //       //     servers.value[index],
    //       //     response.data
    //       //   );
    //       // } else {
    //       //   // Delete server
    //       //   servers.value.splice(index, 1);
    //       // }
    //       // await store.dispatch("settings/setSetting", {
    //       //   key: "servers",
    //       //   value: JSON.stringify(servers.value),
    //       // });
    //       // Reload settings
    //       // store.dispatch("settings/loadSettings");
    //     }
    //   });

    //   await modal.present();
    // };

    return {
      servers,
      addNewserver,
      onUpdateServerClicked,
      add,
    };
  },
};
</script>
