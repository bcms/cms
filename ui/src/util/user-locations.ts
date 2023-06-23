import type { BCMSUser } from '@becomes/cms-sdk/types';
import { ref } from 'vue';

export const userLocations = ref<Array<{ path: string; user: BCMSUser }>>([]);

export function initializeUserLocationsWatcher() {
  setInterval(() => {
    window.bcms.util.throwable(
      async () => {
        return {
          locations: await window.bcms.sdk.routeTracker.getUsers(),
        };
      },
      async (result) => {
        const users = window.bcms.vue.store.getters.user_items;
        userLocations.value = users.map((user) => {
          const loc = result.locations.find((e) => e.id === user._id);
          return {
            user,
            path: loc ? loc.path : '-1',
          };
        });
      },
    );
  }, 1000);
}
