<template>
    <ion-header>
        <ion-toolbar>
            <ion-title>Open URL</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <ion-item>
            <ion-label position="floating">URL</ion-label>
            <ion-input></ion-input>
        </ion-item>
    </ion-content>
</template>

<script>
import { 
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput
} from '@ionic/vue'
export default {
    setup() {
        
    },
    components: {
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonItem,
        IonLabel,
        IonInput
    }
}
</script>