<template>
  <ion-page>
    <ion-loading :is-open="loading" message="Loading contents...">
    </ion-loading>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ titleText }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            @click="onServerDirectoriesClicked"
            :disabled="!connectedState"
          >
            <ion-icon :icon="fileTray" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="onCollectionsClicked" :disabled="!connectedState">
            <ion-icon :icon="bookmarksOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          :disabled="!connectedState"
          v-model="search"
          @ionChange="onSearch"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item
        @click="onPrevDirectoryClicked"
        v-if="files.prevDir"
        :disabled="!connectedState"
      >
        <ion-icon :icon="folder" slot="start"></ion-icon>
        ...
      </ion-item>
      <ion-item
        :disabled="!connectedState"
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
import { apiInstance } from "../api";
import { formatTime, getFileName, getPrevDir } from "../tools";
import { detectFileType } from "../fileformats";

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
  actionSheetController,
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
} from "ionicons/icons";

export default {
  props: ["modalController", "action"],
  setup(props) {
    const store = useStore();
    // Get connected state
    const connectedState = computed(() => store.state.simpleapi.connected);

    const loading = ref(true);
    const files = ref({
      content: [],
      dirname: "",
      prevDir: "",
      cwd: "",
    });
    const filesBak = ref([]);
    const search = ref("");

    const collections = ref([]);
    const serverDirectories = ref([]);

    const showOpenFolder = ref(props.action === "openFolder");
    const filemanLastPath = store.state.settings.settings.filemanLastPath;

    let cwd = ref("");
    let history = store.state.settings.settings.history || [];
    const titleText = computed(() => {
      if (!connectedState.value) return "Disconnected";
      if (cwd.value) return cwd.value;
      else if (files.value.collection_id) {
        const collection = collections.value.find(
          (el) => el.id === parseInt(files.value.collection_id)
        );
        if (collection) return collection.name;
        else return "Unknown collection";
      }
      return "N/A";
    });

    apiInstance
      .get(`/collections`)
      .then((response) => (serverDirectories.value = response.data));

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
      console.log(collectionId);
      // Save to history
      // Render spinner if loading takes more than 200 msec
      // Had to increase timeout because we need to do post-processing on frontend
      let loadingTimeout = setTimeout(() => {
        loading.value = true;
      }, 200);
      apiInstance
        .get(`/collections/${encodeURIComponent(path)}`)
        .then((response) => {
          cwd.value = path;
          let resp = response.data.filter((el) => {
            let type = el["is-directory"]
              ? "directory"
              : detectFileType(el.path.split(".").pop());
            if (type != "file") {
              return el;
            }
          });
          resp = resp
            .map((el) => {
              let type = el["is-directory"]
                ? "directory"
                : detectFileType(el.path.split(".").pop());
              return {
                path: el.path,
                name: getFileName(el.path),
                type,
                priorty: el["is-directory"] ? 1 : 2,
              };
            })
            .sort((a, b) => {
              return (
                a.priorty - b.priorty ||
                a.name.toLowerCase().localeCompare(b.name.toLowerCase())
              );
            });

          // This were handled by node backend, I hope it will work here with new very limited Lua backend.
          files.value.cwd = path;
          files.value.prevDir = getPrevDir(path);
          files.value.dirname = getFileName(path);
          files.value.content = resp;
          filesBak.value = resp;

          search.value = "";
          console.log(files.value);
        })
        .finally(() => {
          clearTimeout(loadingTimeout);
          loading.value = false;
        });
    };

    // FIXME: Duplication of code, come up with better solution!
    if (filemanLastPath) {
      if (filemanLastPath.type == "collection") {
        getDirectoryContents(null, filemanLastPath.collection_id).catch(
          (err) => {
            console.log(err);
            getDirectoryContents();
          }
        );
      } else if (filemanLastPath.type == "directory") {
        getDirectoryContents(filemanLastPath.cwd).catch((err) => {
          console.log(err);
          getDirectoryContents();
        });
      }
    } else {
      getDirectoryContents();
    }

    const onCancelClicked = () => {
      saveLastPath().then(() => props.modalController.dismiss());
    };

    const handlePlayAction = async (entry) => {
      console.log(`Entry ${JSON.stringify(entry)}`);
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
          props.modalController.dismiss({
            filename: entry.path,
            seekTo: entry.mediaStatus.current_time,
          });
        } else if (role === "play") {
          console.log(entry.path);
          saveLastPath().then(() => {
            props.modalController.dismiss({
              filename: entry.path,
              appendToPlaylist: true,
            });
            console.log("Play from start");
          });
        }
      } else {
        saveLastPath().then(() => {
          props.modalController.dismiss({
            filename: entry.path,
            appendToPlaylist: true,
          });
        });
      }
    };

    const onEntryClicked = async (entry) => {
      if (entry.type === "directory") {
        getDirectoryContents(entry.path);
        history.push(files.value.collection_id);
      } else if (
        props.action === "play" &&
        (entry.type === "video" || entry.type === "audio")
      ) {
        handlePlayAction(entry);
      } else if (props.action == "opensub" && entry.type == "subtitle") {
        props.modalController.dismiss({ filename: entry.fullPath });
      }
    };

    const onPrevDirectoryClicked = () => {
      // Get collection
      const collectionId = history.pop();

      if (collectionId !== undefined && collectionId !== null) {
        console.log(`Open collection from history ${collectionId}`);
        getDirectoryContents(null, collectionId);
      } else {
        getDirectoryContents(files.value.prevDir);
      }
      console.log(`New history: ${history}`);
    };

    const onServerDirectoriesClicked = async () => {
      const buttons = serverDirectories.value.map((dir) => {
        return {
          text: dir.path,
          role: dir.path,
        };
      });
      const actionSheet = await actionSheetController.create({
        header: "Select direcotry",
        buttons,
      });

      await actionSheet.present();

      const { role } = await actionSheet.onDidDismiss();

      if (role !== "backdrop") {
        getDirectoryContents(role);
      }
    };
    // const onChangeDriveClicked = async () => {
    //   const buttons = drives.value.map((drive) => {
    //     return {
    //       text: drive._mounted,
    //       role: drive._mounted,
    //     };
    //   });
    //   const actionSheet = await actionSheetController.create({
    //     header: "Select drive",
    //     buttons,
    //   });

    //   await actionSheet.present();

    //   const { role } = await actionSheet.onDidDismiss();
    //   console.log(`Value:${role}`);

    //   if (role !== "backdrop") {
    //     getDirectoryContents(role);
    //     // Clear history
    //     history = [];
    //   }
    // };

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
      files.value.content = Object.assign([], filesBak.value);
      files.value.content = files.value.content.filter(
        (el) => el.name.toLowerCase().indexOf(search.value.toLowerCase()) > -1
      );
    };
    const onOpenDirectoryClicked = () => {
      saveLastPath().then(() => props.modalController.dismiss(files.value.cwd));
    };

    const decideIcon = (entry) => {
      switch (entry.type) {
        case "file":
          return document;
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
      onEntryClicked,
      onSearch,
      decideIcon,
      onCollectionsClicked,
      onServerDirectoriesClicked,
      cwd,
      connectedState,
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
