import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "Root-Login",
    component: () => import(/* webpackChunkName: "login" */ '../views/login.vue')
  },
  {
    path: "/login",
    name: "Login",
    component: () => import(/* webpackChunkName: "login" */ '../views/login.vue')
  },
];
const router = new VueRouter({
  mode: "history",
  routes,
});
export default router;
