import Vue from "vue";
import App from "./app.vue";
import router from "./router";
import './utils/register-global-components'
import '@/assets/styles/main.scss'
import '@/plugins/global/index.js'

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
