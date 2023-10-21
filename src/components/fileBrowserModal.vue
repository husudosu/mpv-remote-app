<template>
  <ion-page>
    <ion-loading :is-open="loading" message="Loading..."> </ion-loading>
    <ion-header>
      <ion-toolbar>
        <ion-title size="small">{{ titleText }}</ion-title>
        <ion-buttons slot="start">
          <ion-button fill="clear" @click="onCancelClicked">
            <ion-icon :icon="arrowBackSharp" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button id="click-trigger">
            <ion-icon :icon="ellipsisVerticalSharp" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-popover trigger="click-trigger" trigger-action="click" :is-open="popoverOpen" dismissOnSelect>
            <ion-content class="ion-padding">
              <ion-list lines="full">
                <ion-item button @click="onSortByClicked">
                  <ion-icon :icon="funnelOutline" slot="start"></ion-icon>
                  <ion-label>Sort by</ion-label>
                </ion-item>
                <ion-item button @click="onChangeDriveClicked">
                  <ion-icon :icon="fileTray" slot="start"></ion-icon>
                  <ion-label>Drives</ion-label>
                </ion-item>
                <ion-item button @click="onCollectionsClicked">
                  <ion-icon :icon="bookmarksOutline" slot="start"></ion-icon>
                  <ion-label>Collections</ion-label>
                </ion-item>
              </ion-list>
            </ion-content>
          </ion-popover>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar :disabled="Object.keys(files).length === 0" v-model="search" @ionInput="onSearch"></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="browserContent" class="ion-padding" :scroll-events="true" @ionScroll="logScroll($event)"
      v-if="(files.cwd || files.collection_id) && connectionState">
      <ion-list>
        <div class="row" @click="onPrevDirectoryClicked" v-if="files.prevDir">
          <div class="columnIcon">
            <ion-icon :icon="folder"> </ion-icon>
          </div>
          <div class="column">...</div>
        </div>

        <div class="row" v-for="(entry, index) in browsableFiles" :key="index" @click="onEntryClicked(entry)">
          <div class="columnIcon">
            <ion-icon slot="start" v-if="entry.mediaStatus && entry.mediaStatus.finished === 0"
              class="mediaStatusProgress" :icon="decideIcon(entry)"></ion-icon>
            <ion-icon slot="start" v-else-if="entry.mediaStatus && entry.mediaStatus.finished === 1"
              class="mediaStatusFinished" :icon="decideIcon(entry)"></ion-icon>
            <ion-icon v-else-if="entry.type === 'subtitle'" class="fileformatSubtitle" :icon="journalOutline"
              slot="start"></ion-icon>
            <ion-icon v-else :icon="decideIcon(entry)" slot="start"></ion-icon>
          </div>
          <div class="column">
            {{ entry.name }}
          </div>
        </div>
        <div class="row" v-if="browsableFiles.length === 0">
          No files found.
        </div>
      </ion-list>
      <ion-infinite-scroll @ionInfinite="onInfiniteScroll($event)" threshold="1000px" id="infinite-scroll"
        :disabled="!infiniteScrollEnabled">
        <ion-infinite-scroll-content loading-spinner="circles" loading-text="Loading more data...">
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
    <ion-content v-else-if="!connectionState">
      Lost connection to server.
    </ion-content>
    <ion-content v-else-if="!loading">
      <ion-list-header>Collections</ion-list-header>
      <ion-list>
        <ion-item lines="full" @click="getDirectoryContents(null, collection.id)" v-for="(collection, i) in collections"
          :key="i">
          {{ collection.name }}
        </ion-item>
        <ion-item lines="full" v-if="collections.length == 0">
          No collection created
        </ion-item>
      </ion-list>

      <ion-list-header>Drives</ion-list-header>
      <ion-list>
        <ion-item lines="full" @click="getDirectoryContents(drive.path)" v-for="(drive, i) in drives" :key="i">
          {{ drive.path }}
        </ion-item>
        <ion-item lines="full" v-if="drives.length == 0">
          No available drive/path to browse
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-fab v-if="scrollToTopEnabled" vertical="bottom" horizontal="end" slot="fixed" @click="onScrollToTopClicked">
      <ion-fab-button>
        <ion-icon :icon="arrowUp"></ion-icon>
      </ion-fab-button>
    </ion-fab>

    <ion-footer v-if="showOpenFolder">
      <ion-button :disabled="!files.cwd" @click="onOpenDirectoryClicked" color="success">
        Open folder
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { apiInstance } from "../api";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonFooter,
  IonButton,
  IonIcon,
  IonButtons,
  IonSearchbar,
  IonLoading,
  IonList,
  IonListHeader,
  IonPopover,
  IonLabel,
  actionSheetController,
  alertController,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  modalController,
} from "@ionic/vue";
import {
  arrowUp,
  folder,
  document,
  fileTray,
  bookmarksOutline,
  musicalNotes,
  film,
  journalOutline,
  funnelOutline,
  arrowBackSharp,
  ellipsisVerticalSharp
} from "ionicons/icons";
import { formatTime } from "../tools";
import {
  FileBrowserSortBy,
  FileBrowserActions,
  FileBrowserEntryTypes,
} from "../enums";

export default {
  props: ["action"],
  setup(props) {
    const store = useStore();
    const serverConfig = computed(
      () => store.state.simpleapi.MPVInfo.mpvremoteConfig
    );
    const files = ref({});

    // Browasble files by ion-infinite scroll
    const browsableFiles = ref([]);
    const INFINITE_SCROLL_STEP = 100;
    const infiniteScrollEnabled = ref(false);

    // Scroll to top
    const scrollToTopEnabled = ref(false);

    const filesBak = ref([]);
    const collections = ref([]);
    const search = ref("");
    const loading = ref(true);
    const browserContent = ref();

    const showOpenFolder = ref(props.action === FileBrowserActions.OPENFOLDER);
    const drives = ref([]);
    const filemanLastPath = store.state.settings.filemanLastPath;
    const sortBy = ref(FileBrowserSortBy.NAME);

    const popoverOpen = ref(false);
    const popoverEvent = ref(null);
    let history = store.getters["settings/getServerHistory"];

    const titleText = computed(() => {
      if (files.value.dirname) return files.value.dirname;
      else if (files.value.collection_id) {
        const collection = collections.value.find(
          (el) => el.id === parseInt(files.value.collection_id)
        );
        if (collection) return collection.name;
        else return "Unknown collection";
      }
      return "Filebrowser";
    });

    const loadFilebrowserSettings = async () => {
      try {
        // Get paths or drives
        if (serverConfig.value.unsafefilebrowsing) {
          await apiInstance
            .get("/drives")
            .then((response) => {
              drives.value = response.data;
            })
            .catch(async () => {
              // If got error fetching driver fallback to filebrowser paths
              await apiInstance
                .get("filebrowser/paths")
                .then((response) => (drives.value = response.data));
            });
        } else {
          await apiInstance
            .get("filebrowser/paths")
            .then((response) => (drives.value = response.data));
        }

        // Get collections.
        if (serverConfig.value.uselocaldb) {
          await apiInstance
            .get("/collections")
            .then((response) => (collections.value = response.data));
        }
      } catch (err) {
        console.log(err);
        store.dispatch("app/showToast", {
          message: `Failed to load settings: ${err}`,
          duration: 5000,
        });
      }
    };

    const loadFileBrowser = async () => {
      await loadFilebrowserSettings();
      if (filemanLastPath) {
        if (filemanLastPath.type == "collection") {
          await getDirectoryContents(null, filemanLastPath.collection_id).catch(
            async () => {
              await getDirectoryContents();
            }
          );
        } else if (filemanLastPath.type == "directory") {
          await getDirectoryContents(filemanLastPath.cwd).catch(async () => {
            await getDirectoryContents();
          });
        }
      }
    };

    const saveLastPath = async () => {
      let filemanLastPath = {};
      if ("cwd" in files.value) {
        filemanLastPath.type = "directory";
        filemanLastPath.cwd = files.value.cwd;
      } else if ("collection_id" in files.value) {
        filemanLastPath.type = "collection";
        filemanLastPath.collection_id = files.value.collection_id;
      }
      // Also save history
      await store.dispatch("settings/updateFilemanHistory", {
        paths: history,
        last_path: filemanLastPath,
      });
    };

    const getDirectoryContents = async (path = null, collectionId = null) => {
      let data = {};
      if (path) data.path = path;
      if (collectionId) data.collection_id = collectionId;
      // Save to history
      // Render spinner if loading takes more than 150 msec
      let loadingTimeout = setTimeout(() => {
        loading.value = true;
      }, 150);
      return await apiInstance
        .post("filebrowser/browse", data)
        .then((response) => {
          files.value = response.data;
          filesBak.value = response.data;
          search.value = "";
          browsableFiles.value = files.value.content.slice(
            0,
            INFINITE_SCROLL_STEP
          );
          // Enable infinite scroll if needed.
          if (files.value.content.length > INFINITE_SCROLL_STEP)
            infiniteScrollEnabled.value = true;
          // Render IO related errors
          if (response.data.errors && response.data.errors.length > 0) {
            store.dispatch("app/showToast", { message: response.data.errors });
          }
        })
        .finally(() => {
          clearTimeout(loadingTimeout);
          loading.value = false;
          browserContent.value.$el.scrollToTop();
        });
    };

    const onInfiniteScroll = (ev) => {
      // Load more items
      if (browsableFiles.value.length !== files.value.content.length) {
        browsableFiles.value.push(
          ...files.value.content.slice(
            browsableFiles.value.length,
            browsableFiles.value.length + INFINITE_SCROLL_STEP
          )
        );
      } else {
        infiniteScrollEnabled.value = false;
      }
      ev.target.complete();
    };

    const onCancelClicked = () => {
      saveLastPath().then(() => modalController.dismiss());
    };

    const handlePlayAction = async (entry) => {
      if (
        entry.mediaStatus &&
        entry.mediaStatus.current_time &&
        entry.mediaStatus.finished === 0
      ) {
        const formattedTime = formatTime(entry.mediaStatus.current_time);
        const actionSheet = await actionSheetController.create({
          header: "Actions",
          buttons: [
            {
              text: `Continue from ${formattedTime} (Start playing now)`,
              role: "continue",
            },
            {
              text: "Play from start (Appends to playlist)",
              role: "play",
            },
          ],
        });

        await actionSheet.present();
        const { role } = await actionSheet.onDidDismiss();

        if (role === "continue") {
          saveLastPath().then(() => {
            modalController.dismiss({
              filename: entry.fullPath,
              seekTo: entry.mediaStatus.current_time,
            });
          });
        } else if (role === "play") {
          saveLastPath().then(() => {
            modalController.dismiss({
              filename: entry.fullPath,
              appendToPlaylist: true,
            });
          });
        }
      } else {
        saveLastPath().then(() => {
          modalController.dismiss({
            filename: entry.fullPath,
            appendToPlaylist: true,
          });
        });
      }
    };

    const onEntryClicked = async (entry) => {
      sortBy.value = FileBrowserSortBy.NAME;
      if (entry.type === "directory") {
        getDirectoryContents(entry.fullPath);
        history.push(files.value.collection_id);
      } else if (
        props.action === FileBrowserActions.PLAY &&
        (entry.type === FileBrowserEntryTypes.VIDEO ||
          entry.type === FileBrowserEntryTypes.AUDIO)
      ) {
        handlePlayAction(entry);
      } else if (
        props.action == FileBrowserActions.OPENSUB &&
        entry.type == FileBrowserEntryTypes.SUBTITLE
      ) {
        modalController.dismiss({ filename: entry.fullPath });
      }
    };

    const onPrevDirectoryClicked = () => {
      // Get collection
      sortBy.value = FileBrowserSortBy.NAME;
      const collectionId = history.pop();

      if (collectionId !== undefined && collectionId !== null) {
        console.log(`Open collection from history ${collectionId}`);
        getDirectoryContents(null, collectionId);
      } else {
        getDirectoryContents(files.value.prevDir);
      }
      console.log(`New history: ${history}`);
    };

    const onChangeDriveClicked = async () => {
      const buttons = drives.value.map((drive) => {
        return {
          text: drive.path,
          role: drive.path,
        };
      });
      const actionSheet = await actionSheetController.create({
        header: "Select path",
        buttons,
      });

      await actionSheet.present();

      const { role } = await actionSheet.onDidDismiss();

      if (role !== "backdrop") {
        getDirectoryContents(role);
        // Clear history
        history = [];
      }
    };

    const onCollectionsClicked = async () => {
      let buttons = collections.value.map((collection) => {
        return {
          text: collection.name,
          role: collection.id,
        };
      });

      const actionSheet = await actionSheetController.create({
        header: "Select collection",
        buttons,
      });
      await actionSheet.present();
      const { role } = await actionSheet.onDidDismiss();

      if (role !== "backdrop") {
        getDirectoryContents(null, role);

        // Clear history
        history = [];
      }
    };

    const onSearch = () => {
      files.value = Object.assign({}, filesBak.value);
      files.value.content = files.value.content.filter(
        (el) => el.name.toLowerCase().indexOf(search.value.toLowerCase()) > -1
      );
      // Enable infinite scroll if needed.
      if (files.value.content.length > INFINITE_SCROLL_STEP)
        infiniteScrollEnabled.value = true;

      browsableFiles.value = files.value.content.slice(0, INFINITE_SCROLL_STEP);
    };
    const onOpenDirectoryClicked = () => {
      saveLastPath().then(() => modalController.dismiss(files.value.cwd));
    };

    const doSort = () => {
      let loadingTimeout = setTimeout(() => {
        loading.value = true;
      }, 150);

      switch (sortBy.value) {
        case FileBrowserSortBy.LASTMODIFIED:
          files.value.cotent = files.value.content.sort((a, b) => {
            return (
              a.priority - b.priority ||
              new Date(b.lastModified) - new Date(a.lastModified)
            );
          });
          break;
        case FileBrowserSortBy.NAME:
          files.value.content = files.value.content.sort((a, b) => {
            return (
              a.priority - b.priority ||
              a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            );
          });
          break;
      }
      // Enable infinite scroll if needed.
      if (files.value.content.length > INFINITE_SCROLL_STEP)
        infiniteScrollEnabled.value = true;

      browsableFiles.value = files.value.content.slice(0, INFINITE_SCROLL_STEP);

      clearInterval(loadingTimeout);
    };
    const onSortByClicked = async () => {
      const alert = await alertController.create({
        header: "Sort by",
        cssClass: "alertbox",
        inputs: [
          {
            type: "radio",
            label: "Name",
            value: FileBrowserSortBy.NAME,
            checked: sortBy.value === FileBrowserSortBy.NAME,
          },
          {
            type: "radio",
            label: "Last modified",
            value: FileBrowserSortBy.LASTMODIFIED,
            checked: sortBy.value === FileBrowserSortBy.LASTMODIFIED,
          },
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Ok",
            handler: (data) => {
              sortBy.value = data;
              doSort();
            },
          },
        ],
      });
      await alert.present();
    };

    const decideIcon = (entry) => {
      switch (entry.type) {
        case "file":
          return files;
        case "directory":
          return folder;
        case "video":
          return film;
        case "audio":
          return musicalNotes;
        case "subtitle":
          return journalOutline;
      }
    };

    const logScroll = async (event) => {
      if (event.detail.scrollTop > 0) scrollToTopEnabled.value = true;
      else scrollToTopEnabled.value = false;
    };

    const onScrollToTopClicked = () => {
      browserContent.value.$el.scrollToPoint(0, 0, 500);
    };


    const openPopover = (e) => {
      popoverEvent.value = e;
      popoverOpen.value = true;
    };

    loadFileBrowser().finally(() => (loading.value = false));
    return {
      logScroll,
      onCancelClicked,
      onPrevDirectoryClicked,
      onOpenDirectoryClicked,
      onChangeDriveClicked,
      onEntryClicked,
      onSearch,
      decideIcon,
      onCollectionsClicked,
      getDirectoryContents,
      onSortByClicked,
      onInfiniteScroll,
      onScrollToTopClicked,
      browsableFiles,
      connectionState: computed(
        () => store.getters["simpleapi/connectionState"]
      ),
      showOpenFolder,
      titleText,
      loading,
      files,
      folder,
      document,
      fileTray,
      bookmarksOutline,
      search,
      musicalNotes,
      journalOutline,
      film,
      collections,
      drives,
      serverConfig,
      funnelOutline,
      infiniteScrollEnabled,
      browserContent,
      arrowBackSharp,
      arrowUp,
      scrollToTopEnabled,
      popoverOpen,
      popoverEvent,
      ellipsisVerticalSharp,
      openPopover
    };
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonFooter,
    IonButton,
    IonIcon,
    IonButtons,
    IonSearchbar,
    IonLoading,
    IonList,
    IonListHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    IonPopover,
    IonLabel
  },
};
</script>

<style scoped>
ion-footer {
  padding: 10px;
  text-align: right;
}

ion-footer ion-button {
  min-width: 120px;
}

.fileformatSubtitle {
  transform: rotate(90deg);
}

.mediaStatusFinished {
  color: green;
}

.mediaStatusProgress {
  color: yellow;
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
  min-width: 72px;
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
