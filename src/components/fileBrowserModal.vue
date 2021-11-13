<template>
  <ion-page>
    <ion-loading :is-open="loading" message="Loading contents...">
    </ion-loading>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ titleText }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="Object.keys(files).length === 0"
            @click="onSortByClicked"
          >
            <ion-icon :icon="funnelOutline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="onChangeDriveClicked">
            <ion-icon :icon="fileTray" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button
            :disabled="!serverConfig.uselocaldb"
            @click="onCollectionsClicked"
          >
            <ion-icon :icon="bookmarksOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          :disabled="Object.keys(files).length === 0"
          v-model="search"
          @ionChange="onSearch"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content
      class="ion-padding"
      v-if="(files.cwd || files.collection_id) && connectedState"
    >
      <ion-item @click="onPrevDirectoryClicked" v-if="files.prevDir">
        <ion-icon :icon="folder" slot="start"></ion-icon>
        ...
      </ion-item>
      <ion-item
        v-for="(entry, index) in files.content"
        :key="index"
        @click="onEntryClicked(entry)"
      >
        <ion-icon
          slot="start"
          v-if="entry.mediaStatus && entry.mediaStatus.finished === 0"
          class="mediaStatusProgress"
          :icon="decideIcon(entry)"
        ></ion-icon>
        <ion-icon
          slot="start"
          v-else-if="entry.mediaStatus && entry.mediaStatus.finished === 1"
          class="mediaStatusFinished"
          :icon="decideIcon(entry)"
        ></ion-icon>
        <ion-icon
          v-else-if="entry.type === 'subtitle'"
          class="fileformatSubtitle"
          :icon="journalOutline"
          slot="start"
        ></ion-icon>
        <ion-icon v-else :icon="decideIcon(entry)" slot="start"></ion-icon>
        {{ entry.name }}
      </ion-item>
    </ion-content>
    <ion-content v-else-if="!connectedState">
      Lost connection to server.
    </ion-content>
    <ion-content v-else-if="!loading">
      <ion-list-header>Collections</ion-list-header>
      <ion-list>
        <ion-item
          @click="getDirectoryContents(null, collection.id)"
          v-for="(collection, i) in collections"
          :key="i"
        >
          {{ collection.name }}
        </ion-item>
        <ion-item v-if="collections.length == 0">
          No collection created
        </ion-item>
      </ion-list>

      <ion-list-header>Drives</ion-list-header>
      <ion-list>
        <ion-item
          @click="getDirectoryContents(drive.path)"
          v-for="(drive, i) in drives"
          :key="i"
        >
          {{ drive.path }}
        </ion-item>
        <ion-item v-if="drives.length == 0">
          No available drive/path to browse
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-button @click="onCancelClicked">Close</ion-button>
      <ion-button
        v-if="showOpenFolder"
        :disabled="!files.cwd"
        @click="onOpenDirectoryClicked"
        color="success"
      >
        Open folder
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { apiInstance, openToast } from "../api";

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
  actionSheetController,
  alertController,
} from "@ionic/vue";
import {
  folder,
  document,
  add,
  fileTray,
  bookmarksOutline,
  musicalNotes,
  film,
  journalOutline,
  funnelOutline,
} from "ionicons/icons";
import { formatTime } from "../tools";
import {
  FileBrowserSortBy,
  FileBrowserActions,
  FileBrowserEntryTypes,
} from "../enums";

export default {
  props: ["modalController", "action"],
  setup(props) {
    const store = useStore();
    const connectedState = computed(() => store.state.simpleapi.connected);
    const serverConfig = computed(
      () => store.state.simpleapi.MPVInfo.mpvremoteConfig
    );
    const files = ref({});
    const collections = ref([]);
    const filesBak = ref([]);
    const search = ref("");
    const loading = ref(true);
    const showOpenFolder = ref(props.action === FileBrowserActions.OPENFOLDER);
    const drives = ref([]);
    const filemanLastPath = store.state.settings.settings.filemanLastPath;
    const sortBy = ref(FileBrowserSortBy.NAME);

    let history = store.state.settings.settings.history || [];
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

    // Get paths or drives
    if (store.state.simpleapi.MPVInfo.mpvremoteConfig.unsafefilebrowsing) {
      apiInstance.get("/drives").then((response) => {
        drives.value = response.data;
      });
    } else {
      apiInstance
        .get("filebrowser/paths")
        .then((response) => (drives.value = response.data));
    }

    // Get collections.
    if (store.state.simpleapi.MPVInfo.mpvremoteConfig.uselocaldb) {
      apiInstance
        .get("/collections")
        .then((response) => (collections.value = response.data));
    }

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
      await store.dispatch("settings/setSetting", {
        key: "history",
        value: JSON.stringify(history),
      });

      if (
        filemanLastPath.cwd != null ||
        filemanLastPath.collection_id != null
      ) {
        return store.dispatch("settings/setSetting", {
          key: "filemanLastPath",
          value: JSON.stringify(filemanLastPath),
        });
      }
    };

    const getDirectoryContents = async (path = null, collectionId = null) => {
      console.log("Get directory contents");
      let data = {};
      if (path) data.path = path;
      if (collectionId) data.collection_id = collectionId;
      // Save to history
      // Render spinner if loading takes more than 150 msec

      let loadingTimeout = setTimeout(() => {
        loading.value = true;
      }, 150);
      return apiInstance
        .post("filebrowser/browse", data)
        .then((response) => {
          files.value = response.data;
          filesBak.value = response.data;
          search.value = "";

          // Render IO related errors
          if (response.data.errors && response.data.errors.length > 0) {
            openToast(response.data.errors, 3000);
          }
        })
        .finally(() => {
          clearTimeout(loadingTimeout);
          loading.value = false;
        });
    };

    if (filemanLastPath) {
      if (filemanLastPath.type == "collection") {
        getDirectoryContents(null, filemanLastPath.collection_id).catch(() => {
          getDirectoryContents();
        });
      } else if (filemanLastPath.type == "directory") {
        getDirectoryContents(filemanLastPath.cwd).catch(() => {
          getDirectoryContents();
        });
      }
    } else {
      loading.value = false;
    }

    const onCancelClicked = () => {
      saveLastPath().then(() => props.modalController.dismiss());
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
          console.log("Continue");
          saveLastPath().then(() => {
            props.modalController.dismiss({
              filename: entry.fullPath,
              seekTo: entry.mediaStatus.current_time,
            });
          });
        } else if (role === "play") {
          saveLastPath().then(() => {
            props.modalController.dismiss({
              filename: entry.fullPath,
              appendToPlaylist: true,
            });
            console.log("Play from start");
          });
        }
      } else {
        saveLastPath().then(() => {
          props.modalController.dismiss({
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
        props.modalController.dismiss({ filename: entry.fullPath });
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
      console.log(`Value:${role}`);

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
    };
    const onOpenDirectoryClicked = () => {
      saveLastPath().then(() => props.modalController.dismiss(files.value.cwd));
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

      clearInterval(loadingTimeout);
    };
    const onSortByClicked = async () => {
      const alert = await alertController.create({
        header: "Sort by",
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

    return {
      onCancelClicked,
      onPrevDirectoryClicked,
      onOpenDirectoryClicked,
      onChangeDriveClicked,
      onEntryClicked,
      onSearch,
      decideIcon,
      onCollectionsClicked,
      getDirectoryContents,
      showOpenFolder,
      titleText,
      loading,
      files,
      folder,
      document,
      add,
      fileTray,
      bookmarksOutline,
      search,
      musicalNotes,
      journalOutline,
      film,
      collections,
      drives,
      connectedState,
      serverConfig,
      funnelOutline,
      onSortByClicked,
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
  },
};
</script>

<style scoped>
ion-footer {
  padding: 10px;
  text-align: right;
}

ion-footer ion-button {
  width: 120px;
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
</style>
