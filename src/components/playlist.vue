<template>
    <ion-list>
        <ion-item v-for="(item, i) in playlist" :key=i>
            
        </ion-item>
    </ion-list>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { IonList, IonItem } from '@ionic/vue';
export default {
    setup() {
        const store = useStore();
        const playlist = computed(() => store.state.mpvsocket.playerData.playlist)

        return {
            playlist
        }
    },
    components: {
        IonList,
        IonItem
    }
};
</script>