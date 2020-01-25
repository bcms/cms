<script context="module">
  import store from './store.js';
  import AxiosClient from './axios-client.js';

  export const Store = store;
  export const axios = AxiosClient.instance();
  axios.config({
    baseURL: '',
    preRequestFunction: AxiosClient.jwtAutoRefreshPreRequestFunction(
      Store,
      '/auth/token/refresh',
      '/login',
    ),
  });

  if (!Store.get('loggedIn')) {
    Store.set('loggedIn', false);
  }
</script>
