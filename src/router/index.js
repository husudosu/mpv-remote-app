import { createRouter, createWebHistory } from '@ionic/vue-router';
import { store } from '../store';
import { disconnect } from '../socketClient'

const routes = [
  {
    path: '',
    redirect: '/folder/player'
  },
  {
    path: '/folder/player',
    component: () => import ('../views/Player.vue')
  },
  {
    path: '/folder/settings',
    component: () => import ('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async(to, from, next) => {
  disconnect()
  await store.dispatch('settings/loadSettings')
  next()
})
export default router
