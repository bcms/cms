import { onBeforeUnmount, type Ref, ref } from 'vue';
import { Storage } from '@thebcms/selfhosted-ui/storage';

let lngCode: Ref<string>;

export interface SetLanguage {
    (lng: string): void;
}

export type LanguageRef = Ref<string>;

export interface UseLanguage {
    (): [LanguageRef, SetLanguage];
}

export const useLanguage: UseLanguage = () => {
    if (!lngCode) {
        lngCode = ref(window.bcms.sdk.storage.get('lng') || 'en');
    }
    const storageUnsub = window.bcms.sdk.storage.subscribe<string>(
        'lng',
        (value) => {
            lngCode.value = value;
        },
    );
    const setLng: SetLanguage = (value) => {
        Storage.set('lng', value).catch((err) => console.error(err));
    };
    onBeforeUnmount(() => {
        storageUnsub();
    });
    return [lngCode, setLng];
};
