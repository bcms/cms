import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ '../views/home.vue')
  },
  {
    path: "/login",
    name: "Login",
    component: () => import(/* webpackChunkName: "login" */ '../views/login.vue')
  },
  {
    path: "/styles",
    name: "Styles",
    component: () => import(/* webpackChunkName: "styles" */ '../views/styles.vue')
  },
];
const router = new VueRouter({
  mode: "history",
  base: '/dashboard',
  routes,
  linkActiveClass: 'is-active',
  linkExactActiveClass: 'is-exact-active'
});
export default router;
