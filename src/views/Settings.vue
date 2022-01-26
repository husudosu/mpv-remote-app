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
        <ion-item :router-link="{ name: 'folder.servers' }"> Servers </ion-item>
        <ion-item
          :router-link="{ name: 'folder.collections' }"
          :disabled="!connectedState || !uselocaldb"
        >
          <ion-label>Media collections</ion-label>
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
  useIonRouter,
} from "@ionic/vue";
export default {
  setup() {
    const store = useStore();
    const router = useIonRouter();

    const connectedState = computed(() => store.state.simpleapi.connected);
    const currentSettings = computed(() => store.state.settings.server);
    const uselocaldb = computed(
      () => store.state.simpleapi.MPVInfo.mpvremoteConfig.uselocaldb
    );

    const onServersClicked = () => {
      router.push({ name: "folder.servers" });
    };
    const onCollectionsClicked = () => {
      router.push({ name: "folder.collections" });
    };
    const setSetting = async (key) => {
      console.log(key);
    };

    return {
      currentSettings,
      setSetting,
      connectedState,
      uselocaldb,
      onServersClicked,
      onCollectionsClicked,
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
  },
};
</script>
