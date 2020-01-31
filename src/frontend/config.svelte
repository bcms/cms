<script context="module">
  import { writable } from 'svelte/store';
  import store from './store.js';
  import AxiosClient from './axios-client.js';

  export const templateStore = writable([]);
  export const groupStore = writable([]);
  export const widgetStore = writable([]);
  export const webhookStore = writable([]);
  export const languageStore = writable([]);
  export const userStore = writable([]);
  export const functionStore = writable([]);
  export const keyStore = writable([]);
  export const Store = store;
  export const axios = AxiosClient.instance();
  export const pathStore = writable('');

  let cacheTill = 0;

  axios.config({
    baseURL: '',
    preRequestFunction: AxiosClient.jwtAutoRefreshPreRequestFunction(
      Store,
      '/auth/token/refresh',
      '/login',
    ),
  });

  if (!Store.get('loggedIn')) {
    cacheTill = 0;
    Store.set('loggedIn', false);
  }

  export async function fatch() {
    if (Store.get('loggedIn') === true) {
      if (cacheTill === 0 || cacheTill < Date.now()) {
        console.log('Fatch data.');
        cacheTill = Date.now() + 60000;
        let result = await axios.send({
          url: '/group/all',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error.response.data.message);
          return;
        }
        groupStore.set(result.response.data.groups);
        result = await axios.send({
          url: '/template/all',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error.response.data.message);
          return;
        }
        templateStore.set(result.response.data.templates);
        result = await axios.send({
          url: '/widget/all',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error.response.data.message);
          return;
        }
        widgetStore.set(result.response.data.widgets);
        result = await axios.send({
          url: '/webhook/all',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error);
          return;
        }
        webhookStore.set(result.response.data.webhooks);
        result = await axios.send({
          url: '/user/all',
          method: 'GET',
        });
        if (result.success === false) {
          simplePopup.error(result.error.response.data.message);
          return;
        }
        userStore.set(result.response.data.users);
        result = await axios.send({
          url: '/language/all',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error.response.data.message);
          return;
        }
        if (result.response.data.languages.length === 0) {
          result = await axios.send({
            url: '/language/en',
            method: 'POST',
          });
          if (result.success === false) {
            console.error(result.error.response.data.message);
            return;
          }
          languageStore.set([result.response.data.language]);
        } else {
          languageStore.set(result.response.data.languages);
        }
        result = await axios.send({
          url: '/key/all',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error.response.data.message);
          return;
        }
        keyStore.update(value => result.response.data.keys);
        result = await axios.send({
          url: '/function/all/available',
          method: 'GET',
        });
        if (result.success === false) {
          console.error(result.error.response.data.message);
          return;
        }
        functionStore.set(result.response.data.functions);
      }
    }
  }
  fatch();
</script>
