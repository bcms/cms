<script context="module">
  import { writable } from 'svelte/store';
  import store from './store.js';
  import AxiosClient from './axios-client.js';

  export const templateStore = writable([]);
  export const entryStore = writable([]);
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
  export const fileStore = writable([]);

  let cacheTill = 0;
  let skipCheck = false;

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

  function check() {
    if (
      Store &&
      Store.get('loggedIn') &&
      Store.get('loggedIn') === true &&
      window.location.pathname !== '/' &&
      window.location.pathname !== '/login'
    ) {
      return true;
    }
    return false;
  }

  export function fatch() {
    if (skipCheck === true || check() === true) {
      if (cacheTill === 0 || cacheTill < Date.now()) {
        console.log('Fatch data.');
        cacheTill = Date.now() + 60000;
        axios
          .send({
            url: '/group/all',
            method: 'GET',
          })
          .then(result => {
            if (result.success === false) {
              console.error(result.error.response.data.message);
              return;
            }
            groupStore.set(result.response.data.groups);
          });
        axios
          .send({
            url: '/template/all',
            method: 'GET',
          })
          .then(result => {
            if (result.success === false) {
              console.error(result.error.response.data.message);
              return;
            }
            templateStore.set(result.response.data.templates);
          });
        axios
          .send({
            url: '/template/entry/all',
            method: 'GET',
          })
          .then(result => {
            if (result.success === false) {
              console.error(result.error.response.data.message);
              return;
            }
            entryStore.set(result.response.data.entries);
          });
        axios
          .send({
            url: '/widget/all',
            method: 'GET',
          })
          .then(result => {
            if (result.success === false) {
              console.error(result.error.response.data.message);
              return;
            }
            widgetStore.set(result.response.data.widgets);
          });
        axios
          .send({
            url: '/webhook/all',
            method: 'GET',
          })
          .then(result => {
            if (result.success === false) {
              console.error(result.error);
              return;
            }
            webhookStore.set(result.response.data.webhooks);
          });
        axios
          .send({
            url: '/language/all',
            method: 'GET',
          })
          .then(async result => {
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
          });
        axios
          .send({
            url: '/media/all/aggregate',
            method: 'GET',
          })
          .then(result => {
            if (result.success === false) {
              simplePopup.error(result.error.response.data.message);
              return;
            }
            result.response.data.media.sort((a, b) => {
              if (a.type === 'DIR' && b.type !== 'DIR') {
                return -1;
              } else if (a.type !== 'DIR' && b.type === 'DIR') {
                return 1;
              }
              return 0;
            });
            fileStore.update(value => result.response.data.media);
          });
        const user = Store.get('user');
        if (user.roles[0].name === 'ADMIN') {
          axios
            .send({
              url: '/user/all',
              method: 'GET',
            })
            .then(result => {
              if (result.success === false) {
                simplePopup.error(result.error.response.data.message);
                return;
              }
              userStore.set(result.response.data.users);
            });
          axios
            .send({
              url: '/key/all',
              method: 'GET',
            })
            .then(result => {
              if (result.success === false) {
                console.error(result.error.response.data.message);
                return;
              }
              keyStore.update(value => result.response.data.keys);
            });
          axios
            .send({
              url: '/function/all/available',
              method: 'GET',
            })
            .then(result => {
              if (result.success === false) {
                console.error(result.error.response.data.message);
                return;
              }
              functionStore.set(result.response.data.functions);
            });
        }
      }
    } else {
      console.log(Store.get('loggedIn'));
    }
  }
  export function forceFatch() {
    cacheTill = 0;
    skipCheck = true;
    fatch();
    skipCheck = false;
  }
  fatch();
</script>
