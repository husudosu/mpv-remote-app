<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
            </ion-buttons>
            <ion-title>Media collections</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen=true>
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Media collections</ion-title>
                </ion-toolbar>
            </ion-header>            
            <ion-toolbar>
                <ion-buttons slot="end">
                    <ion-button color="success">
                        <ion-icon slot="start" :icon="addOutline"></ion-icon>
                        New collection
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
            <ion-list>
                <ion-item>
                    
                </ion-item>
            </ion-list>
        </ion-content>
    </ion-page>
</template>

<script>
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonBackButton,
    IonButton,
    IonIcon
} from '@ionic/vue';
import {
    addOutline
} from 'ionicons/icons';
export default {
    setup() {
        
        return {
            addOutline
        }
    },
    components:{
        IonPage,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonBackButton,
        IonButton,
        IonIcon
    }
}
</script>