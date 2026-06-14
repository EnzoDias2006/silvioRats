import { createRouter, createWebHistory } from "vue-router";
import AdminView from "../features/admin/AdminView.vue";
import FeedView from "../features/feed/FeedView.vue";
import HangoutsView from "../features/hangouts/HangoutsView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: FeedView },
    { path: "/hangouts", component: HangoutsView },
    { path: "/admin", component: AdminView },
  ],
});
