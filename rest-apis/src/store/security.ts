import { ref } from 'vue';

export interface SecurityStore {
  [name: string]: {
    prettyName: string;
    type: string;
    schema: string;
    value: string;
  };
}

export const securityStore = ref<SecurityStore>({});
