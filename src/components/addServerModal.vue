<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="onCancelClicked">
            <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>{{ modalTitle }}</ion-title>
        <ion-buttons slot="end" v-if="allowDelete">
          <ion-button color="error" @click="onDeleteClicked">
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list-header>Server info</ion-list-header>
      <ion-list>
        <ion-item lines="full">
          <ion-input
            placeholder="Name"
            type="text"
            v-model="dialog.name"
          ></ion-input>
        </ion-item>

        <ion-item lines="full">
          <ion-input
            placeholder="Host"
            type="text"
            v-model="dialog.host"
          ></ion-input>
        </ion-item>
        <ion-item lines="full">
          <ion-input
            placeholder="Host"
            type="number"
            v-model="dialog.port"
          ></ion-input>
        </ion-item>
      </ion-list>

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
import { ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  IonList,
  IonListHeader,
  IonButtons,
  IonIcon,
} from "@ionic/vue";
import { trash, arrowBack } from "ionicons/icons";
export default {
  props: ["modalController", "server"],
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonItem,
    IonButton,
    IonList,
    IonListHeader,
    IonButtons,
    IonIcon,
  },
  setup(props) {
    let modalTitle = ref("Add server");
    let dialog = ref({
      name: "",
      host: "",
      port: 8000,
    });
    const allowDelete = ref(false);

    if (props.server) {
      dialog.value = Object.assign(dialog.value, props.server);
      modalTitle.value = "Update server";
      allowDelete.value = true;
    }

    const onCancelClicked = () => {
      console.log("Cancel clicked");
      props.modalController.dismiss();
    };

    const onSubmitClicked = () => {
      // Validate server data
      let errors = [];
      dialog.value.name = dialog.value.name.trim();
      dialog.value.host = dialog.value.host.trim();

      if (dialog.value.name.length === 0) errors.push("Name required");
      if (dialog.value.host.length === 0) errors.push("Host required");

      if (isNaN(dialog.value.port)) errors.push("Port should be number");
      else if (dialog.value.port <= 0)
        errors.push("Port should be greater than 0");
      else if (dialog.value.port > 65535)
        errors.push("Port should be smaller than 65535");

      if (errors.length > 0) alert(errors.join("\n"));
      else props.modalController.dismiss(dialog.value);
    };

    const onDeleteClicked = () => {
      if (confirm("Delete server?")) {
        props.modalController.dismiss({ delete: true });
      }
    };

    return {
      dialog,
      modalTitle,
      allowDelete,
      onCancelClicked,
      onSubmitClicked,
      onDeleteClicked,
      trash,
      arrowBack,
    };
  },
};
</script>
