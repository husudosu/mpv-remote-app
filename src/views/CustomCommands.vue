<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-buttons slot="start">
                    <ion-menu-button color="#fff"></ion-menu-button>
                </ion-buttons>
                <ion-title>
                    Custom commands
                </ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true">
            <ion-button @click="addCustomCommand">Add custom command</ion-button>
            <ion-button @click="getCustomCommands">Get custom commands</ion-button>
            <ion-button @click="updateCustomCommand">Update custom command</ion-button>
            <ion-button @click="deleteCustomCommand">Delete custom command</ion-button>
        </ion-content>
    </ion-page>
</template>


<script>
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonButton
} from "@ionic/vue";
import { useStore } from "vuex";

export default {
    setup() {
        const store = useStore();
        const addCustomCommand = async () => {
            console.log("Ok");
            await store.dispatch("settings/addCustomCommand", {
                name: "Test custom command",
                server_id: 1,
                command: "Test",
                default_args: JSON.stringify(["arg0", "arg1"])
            });
        };
        const updateCustomCommand = async () => {
            console.log("Ok");
        };

        const getCustomCommands = async () => {
            console.log("OK");
        };
        const deleteCustomCommand = async () => {
            console.log("Ok");
        };
        return {
            addCustomCommand,
            updateCustomCommand,
            deleteCustomCommand,
            getCustomCommands
        };
    },
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonTitle,
        IonContent,
        IonButton
    }
};
</script>