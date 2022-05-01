<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="#fff"></ion-menu-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Settings</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item lines="full" @click="onServersClicked" button>
          Servers
        </ion-item>
        <ion-item
          lines="full"
          button
          @click="onCollectionsClicked"
          :disabled="!connectedState || !uselocaldb"
        >
          <ion-label>Media collections</ion-label>
        </ion-item>

        <ion-item lines="full">
          <ion-label>Android notification (Experimental)</ion-label>
          <ion-checkbox
            :checked="androidNotificationEnabled"
            @ionChange="onAndroidNotificationEnabledChange($event)"
            slot="end"
          ></ion-checkbox>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  // useIonRouter,
  modalController,
} from "@ionic/vue";
import Servers from "./Servers.vue";
import Collections from "./Collections.vue";
import musicControls from "cordova-plugin-music-controls2/www/MusicControls.js";
export default {
  setup() {
    const store = useStore();
    // const router = useIonRouter();

    const connectedState = computed(() => store.state.simpleapi.connected);
    const uselocaldb = computed(
      () => store.state.simpleapi.MPVInfo.mpvremoteConfig.uselocaldb
    );
    // TODO also implesment androidNotificationEnabled on contanier, turn off battery saving if it's enabled
    /* FIXME: Need to use modals here because router messing up when changing between Servers and Media collections
    Please help me with this problem!
    Routes also disabled on router/index.js if you want to experiment with this uncomment routes.
    */
    const onServersClicked = async () => {
      // router.push({ name: "folder.servers" });
      console.log("Servers clicked");
      const modal = await modalController.create({
        component: Servers,
      });
      await modal.present();
    };
    const onCollectionsClicked = async () => {
      // router.push({ name: "folder.collections" });
      const modal = await modalController.create({
        component: Collections,
      });
      await modal.present();
    };

    const onAndroidNotificationEnabledChange = async (event) => {
      await store.dispatch("settings/setSetting", {
        key: "androidNotificationEnabled",
        value: event.target.checked,
      });
      if (!event.target.checked) {
        console.log("Remove notification if exists");
        musicControls.destroy();
      }
    };
    return {
      connectedState,
      uselocaldb,
      onServersClicked,
      onCollectionsClicked,
      androidNotificationEnabled: computed(
        () => store.getters["settings/androidNotificationEnabled"]
      ),
      onAndroidNotificationEnabledChange,
    };
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonContent,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
  },
};
</script>
