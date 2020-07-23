<template>
  <div id="bcms">
    <bcms-sidebar ref="sidebar" />
    <router-view />
  </div>
</template>

<script>
import BcmsSidebar from './components/sidebar/sidebar.vue';
import { debounce } from 'lodash';
export default {
  name: 'App',
  components: {
    BcmsSidebar,
  },
  mounted() {
    const calculateCustomCSSProperties = () => {
      document.documentElement.style.setProperty(
        '--vh',
        `${window.innerHeight * 0.01}px`,
      );
      document.documentElement.style.setProperty(
        '--sidebar-nav-top-position',
        `${this.$refs.sidebar.$el.querySelector('.nav').offsetTop}px`,
      );
    };
    if (typeof window !== 'undefined') {
      calculateCustomCSSProperties();

      window.addEventListener(
        'resize',
        debounce(calculateCustomCSSProperties, 100),
      );
      window.addEventListener(
        'orientationchange',
        debounce(calculateCustomCSSProperties, 100),
      );
    }
  },
};
</script>
