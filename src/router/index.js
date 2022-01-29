import { createRouter, createWebHistory } from "@ionic/vue-router";
const routes = [
  {
    path: "",
    redirect: "/folder/player",
  },
  {
    name: "folder.player",
    path: "/folder/player",
    component: () => import("../views/Player.vue"),
  },
  {
    name: "folder.playlist",
    path: "/folder/playlist",
    component: () => import("../views/Playlist.vue"),
  },
  {
    name: "folder.settings",
    path: "/folder/settings",
    component: () => import("../views/Settings.vue"),
  },
  // {
  //   name: "folder.collections",
  //   path: "/folder/collections",
  //   component: () => import("../views/Collections.vue"),
  // },
  // {
  //   name: "folder.servers",
  //   path: "/folder/servers",
  //   component: () => import("../views/Servers.vue"),
  // },
  {
    name: "folder.about",
    path: "/folder/about",
    component: () => import("../views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log(`Navigate from: ${from.name}`);
  console.log(`Navigate to: ${to.name}`);
  console.log("------------");
  next();
});

export default router;
