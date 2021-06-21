import { createRouter, createWebHistory } from '@ionic/vue-router';
import { store } from '../store';
import { connect } from '../socketClient';

const routes = [
  {
    path: '',
    redirect: '/folder/player'
  },
  {
    name: 'folder.player',
    path: '/folder/player',
    component: () => import ('../views/Player.vue')
  },
  {
    name: 'folder.settings',
    path: '/folder/settings',
    component: () => import ('../views/Settings.vue')
  },
  {
    name: 'folder.playlist',
    path: '/folder/playlist',
    component: () => import('../views/Playlist.vue')
  },
  {
    name: 'folder.settings.collections',
    path: '/folder/settings/collections',
    component: () => import('../views/Collections.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async(to, from, next) => {
  console.log(to.name)
  await store.dispatch('settings/loadSettings')
  if (store.state.settings.configured && !store.state.mpvsocket.connected) {
    connect();
  }
  next()
})
export default router
