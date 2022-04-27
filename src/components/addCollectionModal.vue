<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ modalTitle }}</ion-title>
        <ion-buttons slot="start">
          <ion-button @click="onCancelClicked">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-buttons slot="end" v-if="allowDelete">
          <ion-button @click="onDeleteCollectionCliced">
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list-header>Collection info</ion-list-header>
      <ion-list>
        <ion-item lines="full">
          <ion-input
            placeholder="Name"
            type="text"
            v-model="dialog.name"
            :value="dialog.name"
          ></ion-input>
        </ion-item>
        <ion-item lines="full">
          <ion-label>Media type</ion-label>
          <ion-select
            :value="dialog.type"
            v-model="dialog.type"
            :interface-options="{ cssClass: 'alertbox' }"
          >
            <!-- // TYPE Can be: Movies - 1, TVShows - 2, Music - 3 !-->
            <ion-select-option :value="1"> Movies </ion-select-option>
            <ion-select-option :value="2"> TVShows </ion-select-option>
            <ion-select-option :value="3"> Music </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>

      <ion-list-header>Paths</ion-list-header>
      <ion-item lines="full" @click="onAddPathClicked" button
        >Add path</ion-item
      >
      <ion-item lines="full" v-for="(path, i) in dialog.paths" :key="i">
        <ion-label class="ion-text-wrap">
          {{ path.path }}
        </ion-label>
        <ion-button fill="none" slot="end" @click="onDeletePathClicked(path)"
          ><ion-icon slot="icon-only" :icon="trashBin"></ion-icon
        ></ion-button>
      </ion-item>
      <ion-button
        style="margin-top: 10px"
        color="success"
        expand="block"
        @click="onSubmitClicked"
        >Save</ion-button
      >
    </ion-content>
  </ion-page>
</template>
<script>
import { computed, ref } from "vue";
import { trashBin, trash, arrowBack } from "ionicons/icons";
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
  IonButton,
  IonList,
  IonListHeader,
  IonIcon,
  modalController,
  IonButtons,
} from "@ionic/vue";
import fileBrowserModal from "../components/fileBrowserModal.vue";
import { apiInstance } from "../api";
import { FileBrowserActions } from "../enums";

export default {
  props: ["modalController", "collection"],
  setup(props) {
    const allowDelete = ref(false);
    const dialog = ref({
      name: "",
      type: 1,
      paths: [],
    });
    if (props.collection) {
      dialog.value = structuredClone(props.collection);
      allowDelete.value = true;
    }

    const modalTitle = computed(() =>
      props.collection ? "Update collection" : "Create collection"
    );

    const onCancelClicked = () => {
      props.modalController.dismiss();
    };

    const validateForm = () => {
      let errors = [];
      if (dialog.value.name.length === 0) {
        errors.push("Name required!");
      }
      if (dialog.value.paths.length === 0) {
        errors.push("At least one path required!");
      }

      if (errors.length > 0) {
        alert(`Validation errors:\n-${errors.join("\n-")}`);
        return false;
      } else return true;
    };

    const onSubmitClicked = () => {
      if (validateForm()) {
        props.modalController.dismiss(dialog.value);
      }
    };

    const onDeleteCollectionCliced = () => {
      if (confirm(`Delete collection: ${dialog.value.name}?`)) {
        dialog.value.deleted = true;
        props.modalController.dismiss(dialog.value);
      }
    };

    const onDeletePathClicked = async (item) => {
      if ("id" in item) {
        if (confirm(`Delete path: ${item.path}?`)) {
          apiInstance
            .delete(`/collections/entries/${item.id}`)
            .then(() =>
              dialog.value.paths.splice(dialog.value.paths.indexOf(item), 1)
            );
        }
      } else {
        dialog.value.paths.splice(dialog.value.paths.indexOf(item), 1);
      }
    };
    const onAddPathClicked = async () => {
      const modal = await modalController.create({
        component: fileBrowserModal,
        componentProps: {
          modalController: modalController,
          action: FileBrowserActions.OPENFOLDER,
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
      trash,
      dialog,
      modalTitle,
      onCancelClicked,
      onSubmitClicked,
      onAddPathClicked,
      onDeletePathClicked,
      arrowBack,
      trashBin,
      onDeleteCollectionCliced,
      allowDelete,
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
    IonButton,
    IonSelectOption,
    IonList,
    IonListHeader,
    IonIcon,
    IonButtons,
  },
};
</script>
