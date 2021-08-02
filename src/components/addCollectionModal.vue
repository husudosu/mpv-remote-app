<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ modalTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list-header>Collection info</ion-list-header>
      <ion-list>
        <ion-item>
          <ion-input
            placeholder="Name"
            type="text"
            v-model="dialog.name"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Media type</ion-label>
          <ion-select :value="dialog.type" v-model="dialog.type">
            <!-- // TYPE Can be: Movies - 1, TVShows - 2, Music - 3 !-->
            <ion-select-option :value="1"> Movies </ion-select-option>
            <ion-select-option :value="2"> TVShows </ion-select-option>
            <ion-select-option :value="3"> Music </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-list-header>Paths</ion-list-header>
      <ion-item @click="onAddPathClicked">Add path</ion-item>
      <ion-item v-for="(path, i) in dialog.paths" :key="i">
        {{ path.path }}
        <ion-button @click="onDeletePathClicked(path)">Delete</ion-button>
      </ion-item>
    </ion-content>
    <ion-footer>
      <ion-button @click="onCancelClicked">Cancel</ion-button>
      <ion-button color="success" @click="onSubmitClicked">Create</ion-button>
    </ion-footer>
  </ion-page>
</template>
<script>
import { ref, computed } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonFooter,
  IonButton,
  IonList,
  IonListHeader,
  modalController,
} from "@ionic/vue";
import fileBrowserModal from "../components/fileBrowserModal.vue";

export default {
  props: ["modalController", "collection"],
  setup(props) {
    const dialog = ref({
      name: "",
      type: 1,
      paths: [],
    });
    // TODO: Patch
    if (props.collection) Object.assign(props.collection, dialog.value);

    const modalTitle = computed(() =>
      props.collection ? "Update collection" : "Create collection"
    );

    const onCancelClicked = () => {
      props.modalController.dismiss();
    };

    const onSubmitClicked = () => {
      props.modalController.dismiss(dialog.value);
    };

    const onDeletePathClicked = async (item) => {
      if ("id" in item) {
        // TODO: Delete API level
        dialog.value.paths.splice(dialog.value.paths.indexOf(item), 1);
      } else {
        dialog.value.paths.splice(dialog.value.paths.indexOf(item), 1);
      }
    };
    const onAddPathClicked = async () => {
      const modal = await modalController.create({
        component: fileBrowserModal,
        componentProps: {
          modalController: modalController,
          action: "openFolder",
        },
      });

      await modal.present();
      modal.onDidDismiss().then((response) => {
        if (response.data) {
          dialog.value.paths.push({
            path: response.data,
          });
        }
      });
    };
    return {
      dialog,
      modalTitle,
      onCancelClicked,
      onSubmitClicked,
      onAddPathClicked,
      onDeletePathClicked,
    };
  },
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonSelect,
    IonItem,
    IonLabel,
    IonFooter,
    IonButton,
    IonSelectOption,
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
</style>
