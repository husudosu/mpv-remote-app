<template>
  <IonApp>
    <IonSplitPane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-toast
            :is-open="toast.isOpen"
            :message="toast.message"
            :duration="toast.duration"
            @didDismiss="setToastState(false)"
          />
          <ion-list id="inbox-list">
            <ion-list-header>MPV Remote</ion-list-header>
            <template v-if="servers.length > 0">
              <ion-select
                class="serverSelect"
                interface="action-sheet"
                placeholder="No server selected"
                :value="currentServerId"
                @ionChange="setCurrentServer($event.target.value)"
              >
                <ion-select-option
                  v-for="server in servers"
                  :key="server.id"
                  :value="server.id"
                >
                  {{ server.name }} ({{ server.host }}:{{ server.port }})
                </ion-select-option>
              </ion-select>
            </template>
            <template v-else>
              <div class="serverSelect">No server configured</div>
            </template>
            <div class="horizontalLine"></div>
            <ion-menu-toggle
              auto-hide="false"
              v-for="(p, i) in appPages"
              :key="i"
            >
              <ion-item
                @click="selectedPageIndex = i"
                router-direction="root"
                :router-link="p.url"
                lines="none"
                detail="false"
                class="hydrated"
                :class="{ selected: selectedPageIndex === i }"
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
import { computed, defineComponent, ref } from "vue";
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
  IonRouterOutlet,
  IonSplitPane,
  IonSelect,
  IonSelectOption,
  IonToast,
} from "@ionic/vue";
import {
  playCircleOutline,
  cogOutline,
  listOutline,
  informationCircleOutline,
} from "ionicons/icons";
import { getPlatforms } from "@ionic/vue";
import { App } from "@capacitor/app";
import { useStore } from "vuex";

import { AndroindIntentActions } from "./enums";
import { apiInstance } from "./api";

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
    IonRouterOutlet,
    IonSplitPane,
    IonSelect,
    IonSelectOption,
    IonToast,
  },
  setup() {
    const store = useStore();
    const platforms = getPlatforms();
    const selectedPageIndex = ref(0);
    /*
    Side menu handler
    */
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
      selectedPageIndex.value = appPages.findIndex(
        (page) => page.title.toLowerCase() === path.toLowerCase()
      );
    }

    /*
    Initalize app
    */
    const initApp = async () => {
      await store.dispatch(
        "settings/setCurrentServer",
        store.getters["settings/currentServerId"]
      );

      if (platforms.includes("hybrid")) {
        console.log("Registering indent");
        registerBroadcastReceiver();
        window.plugins.intentShim.onIntent((intent) => {
          handleIntent(intent);
        });
      }
    };

    /*
    Handling of Android intents.
    */
    const handleSendIntent = async (intent) => {
      intent.clipItems.forEach((el) => {
        apiInstance.post("playlist", {
          filename: el.text,
          flag: "append-play",
        });
      });
    };
    const handleViewIntent = async (intent) => {
      let headerArray = [];
      if (Object.prototype.hasOwnProperty.call(intent.extras, "headers")) {
        for (var i = 0; i < intent.extras.headers.length - 1; i += 2) {
          headerArray.push(
            `${intent.extras.headers[i]}: ${intent.extras.headers[i + 1]}`
          );
        }
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
    const handleIntent = async (intent) => {
      // console.log("Full intent object" + JSON.stringify(intent));
      if (Object.prototype.hasOwnProperty.call(intent, "action")) {
        switch (intent.action) {
          case AndroindIntentActions.SEND:
            handleSendIntent(intent);
            break;
          case AndroindIntentActions.VIEW:
            handleViewIntent(intent);
            break;
          default:
            break;
        }
      }
    };
    const registerBroadcastReceiver = () => {
      window.plugins.intentShim.registerBroadcastReceiver(
        {
          filterActions: [
            "com.darryncampbell.cordova.plugin.broadcastIntent.ACTION",
          ],
        },
        (intent) => {
          //  Broadcast received
          handleIntent(intent);
        }
      );
    };
    const unregisterBroadcastReceiver = () => {
      window.plugins.intentShim.unregisterBroadcastReceiver();
    };

    // Listeners
    if (!platforms.includes("hybrid")) initApp();
    document.addEventListener("deviceReady", () => initApp());
    window.addEventListener("orientationchange", function () {
      store.commit("app/setScreenOrinetation", screen.orientation.type);
    });
    App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        // Set screen orientation if active
        store.commit("app/setScreenOrinetation", screen.orientation.type);
        await apiInstance.get("/status").then((response) => {
          store.commit("simpleapi/setPlayerData", response.data);
          if (
            platforms.includes("hybrid") &&
            store.getters["settings/androidNotificationEnabled"] === true
          )
            store.dispatch("simpleapi/handleMusicControls");
        });

        if (!store.state.simpleapi.playbackRefreshInterval)
          store.dispatch("simpleapi/setPlaybackRefreshInterval");
        if (!store.state.settings.dbSession)
          await store.dispatch("settings/initDbSession");

        if (platforms.includes("hybrid")) registerBroadcastReceiver();
      } else {
        // Battery saving stuff

        // Clear update interval only if notiifcations disabled
        if (store.getters["settings/androidNotificationEnabled"] === false) {
          store.commit("simpleapi/clearPlaybackRefreshInterval");
        }
        await store.dispatch("settings/closeDbConnection");
        if (platforms.includes("hybrid")) unregisterBroadcastReceiver();
      }
    });

    const setToastState = async (state) => {
      store.commit("app/setToastState", state);
    };

    return {
      selectedPageIndex,
      appPages,
      servers: computed(() => store.getters["settings/servers"]),
      currentServerId: computed(
        () => store.getters["settings/currentServerId"]
      ),
      setCurrentServer: (serverId) =>
        store.dispatch("settings/setCurrentServer", serverId),
      setToastState,
      toast: computed(() => store.state.app.toast),
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
  --padding-start: 10px;
  --padding-end: 10px;
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

.horizontalLine {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
  border-bottom: 1px solid var(--ion-item-border-color, #d7d8da);
}
.serverSelect {
  width: 100%;
  justify-content: left;
  padding-left: 10px;
}

.serverSelect::part(text) {
  color: #04c8c5;
  padding-left: 0px;
  margin-left: 0px;
}
</style>
