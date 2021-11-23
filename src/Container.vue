<template>
  <IonApp>
    <IonSplitPane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="inbox-list">
            <ion-list-header>MPV Remote</ion-list-header>
            <ion-note>{{ version }}</ion-note>

            <ion-menu-toggle
              auto-hide="false"
              v-for="(p, i) in appPages"
              :key="i"
            >
              <ion-item
                @click="selectedIndex = i"
                router-direction="root"
                :router-link="p.url"
                lines="none"
                detail="false"
                class="hydrated"
                :class="{ selected: selectedIndex === i }"
              >
                <ion-icon
                  slot="start"
                  :ios="p.iosIcon"
                  :md="p.mdIcon"
                ></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </IonSplitPane>
  </IonApp>
</template>

<script>
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
} from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import {
  playCircleOutline,
  cogOutline,
  listOutline,
  informationCircleOutline,
} from "ionicons/icons";
import { App } from "@capacitor/app";

import { useStore } from "vuex";
import { configureInstance, apiInstance } from "./api";
import appInfo from "./verinfo";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonRouterOutlet,
    IonSplitPane,
  },
  setup() {
    const selectedIndex = ref(0);
    const store = useStore();
    const route = useRoute();
    const appPages = [
      {
        title: "Player",
        url: "/folder/player",
        iosIcon: playCircleOutline,
        mdIcon: playCircleOutline,
      },
      {
        title: "Playlist",
        url: "/folder/playlist",
        iosIcon: listOutline,
        mdIcon: listOutline,
      },
      {
        title: "Settings",
        url: "/folder/settings",
        iosIcon: cogOutline,
        mdIcon: cogOutline,
      },
      {
        title: "About",
        url: "/folder/about",
        iosIcon: informationCircleOutline,
        mdIcon: informationCircleOutline,
      },
    ];
    const path = window.location.pathname.split("folder/")[1];
    if (path !== undefined) {
      selectedIndex.value = appPages.findIndex(
        (page) => page.title.toLowerCase() === path.toLowerCase()
      );
    }
    const handleIntent = async (intent) => {
      console.log("Full intent object" + JSON.stringify(intent));
      // if (Object.prototype.hasOwnProperty.call(intent.extras, "title"))
      //   openToast(`Loading: ${intent.extras.title}`, 1500);
      let headerArray = [];

      if (Object.prototype.hasOwnProperty.call(intent.extras, "headers")) {
        for (var i = 0; i < intent.extras.headers.length - 1; i += 2) {
          headerArray.push(
            `${intent.extras.headers[i]}: ${intent.extras.headers[i + 1]}`
          );
        }
        console.log(headerArray);
      }

      if (Object.prototype.hasOwnProperty.call(intent, "data")) {
        let reqData = {
          filename: intent.data,
          flag: "replace",
        };
        reqData["file-local-options"] = {};
        if (headerArray.length > 0)
          reqData["file-local-options"]["http-header-fields"] = headerArray;
        if (Object.prototype.hasOwnProperty.call(intent.extras, "title"))
          reqData["file-local-options"]["force-media-title"] =
            intent.extras.title;
        apiInstance.post("playlist", reqData);
      }
    };

    const registerBroadcastReceiver = () => {
      console.log("Intent listener registered");
      window.plugins.intentShim.registerBroadcastReceiver(
        {
          filterActions: [
            "com.darryncampbell.cordova.plugin.broadcastIntent.ACTION",
          ],
        },
        (intent) => {
          //  Broadcast received
          console.log("Intent recivied");
          handleIntent(intent);
        }
      );
    };

    const unregisterBroadcastReceiver = () => {
      console.log("Intent listener unregistered");
      window.plugins.intentShim.unregisterBroadcastReceiver();
    };

    document.addEventListener("deviceReady", () => {
      store.dispatch("settings/loadSettings").then(() => {
        configureInstance(
          store.state.settings.settings.server.server_ip,
          store.state.settings.settings.server.server_port
        );
        // Register intent handling
        registerBroadcastReceiver();
        window.plugins.intentShim.onIntent((intent) => {
          handleIntent(intent);
        });
        apiInstance.get("/status").then((response) => {
          console.log(response.data);
          store.commit("simpleapi/setPlayerData", response.data);
        });
        store.dispatch("simpleapi/setPlaybackRefreshInterval");
      });

      window.addEventListener("orientationchange", function () {
        store.commit("app/setScreenOrinetation", screen.orientation.type);
      });
    });

    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        // Set screen orientation if active
        store.commit("app/setScreenOrinetation", screen.orientation.type);
        apiInstance.get("/status").then((response) => {
          store.commit("simpleapi/setPlayerData", response.data);
        });
        if (!store.state.simpleapi.playbackRefreshInterval) {
          store.dispatch("simpleapi/setPlaybackRefreshInterval");
        }

        registerBroadcastReceiver();
      } else {
        // Battery saving stuff
        store.commit("simpleapi/clearPlaybackRefreshInterval");
        unregisterBroadcastReceiver();
      }
    });

    return {
      selectedIndex,
      appPages,
      cogOutline,
      informationCircleOutline,
      listOutline,
      playCircleOutline,
      version: appInfo.version,
      isSelected: (url) => (url === route.path ? "selected" : ""),
    };
  },
});
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;

  margin-bottom: 18px;

  color: #757575;

  min-height: 26px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.25);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: #616e7e;
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.md ion-item.selected ion-label {
  color: rgb(151, 149, 149);
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #73849a;
}

ion-menu.ios ion-list#labels-list ion-list-header {
  margin-bottom: 8px;
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
