import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

export interface ScreenData {
    width: number;
    height: number;
}

export interface UseScreenSize {
    (onChange?: (data: ScreenData) => void): [
        /**
         * Screen data
         */
        Ref<ScreenData>,
    ];
}

export const useScreenSize: UseScreenSize = (onChange) => {
    const data = ref<ScreenData>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    function resize() {
        data.value.width = window.innerWidth;
        data.value.height = window.innerHeight;
        if (onChange) {
            onChange(data.value);
        }
    }

    onMounted(() => {
        window.addEventListener('resize', resize);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', resize);
    });

    return [data];
};
