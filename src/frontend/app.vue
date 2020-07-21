<template>
  <div id="bcms">
    <bcms-sidebar />
    <router-view />
  </div>
</template>

<script>
import BcmsSidebar from './components/sidebar.vue'
export default {
  name: "App",
  components: {
    BcmsSidebar
  }
};
</script>
