<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ modalTitle }}</ion-title>
        <ion-buttons slot="end" v-if="allowDelete">
          <ion-button color="error" @click="onDeleteClicked">
            <ion-icon :icon="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list-header>Server info</ion-list-header>
      <ion-list>
        <ion-item>
          <ion-input
            placeholder="Name"
            type="text"
            v-model="dialog.name"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            placeholder="Host"
            type="text"
            v-model="dialog.host"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            placeholder="Host"
            type="number"
            v-model="dialog.port"
          ></ion-input>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <ion-button @click="onCancelClicked">Cancel</ion-button>
      <ion-button color="success" @click="onSubmitClicked">Save</ion-button>
    </ion-footer>
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
  IonFooter,
  IonButton,
  IonList,
  IonListHeader,
  IonButtons,
  IonIcon,
} from "@ionic/vue";
import { trash } from "ionicons/icons";
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
    IonFooter,
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
      console.log("Submit clicked");
      props.modalController.dismiss(dialog.value);
    };

    const onDeleteClicked = () => {
      console.log("Delete clicked");
      props.modalController.dismiss({ delete: true });
    };

    return {
      dialog,
      modalTitle,
      allowDelete,
      onCancelClicked,
      onSubmitClicked,
      onDeleteClicked,
      trash,
    };
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
