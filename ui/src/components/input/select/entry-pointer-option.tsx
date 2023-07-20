import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { DefaultComponentProps } from '../../_default';
import type { BCMSSelectOption } from '../../../types';
import { BCMSImage } from '@ui/components';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    option: {
      type: Object as PropType<BCMSSelectOption>,
      required: true,
    },
  },
  setup(props) {
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;

    const image = computed(() => {
      return store.getters.media_findOne((e) => e._id === props.option.imageId);
    });

    onMounted(async () => {
      await throwable(async () => {
        if (props.option.imageId) {
          await window.bcms.sdk.media.getById(props.option.imageId);
        }
      });
    });

    return () => (
      <div class="flex items-center justify-between gap-5 w-full p-4.5 text-left border-b border-[#CBCBD5] dark:border-[#5A5B5E] transition-colors duration-300 group-hover:bg-dark/5 group-focus:bg-dark/5 dark:group-hover:bg-dark/10 dark:group-focus:bg-dark/10">
        <div>
          <div class="leading-tight -tracking-0.01 font-semibold truncate dark:text-light">
            {props.option.label}
          </div>
          {props.option.subtitle && (
            <div class="leading-tight -tracking-0.01 font-light mt-2.5 line-clamp-2 dark:text-light">
              {props.option.subtitle}
            </div>
          )}
        </div>
        {image.value && (
          <div class="flex flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-[#CBCBD5] md:w-[100px] md:h-[100px]">
            <BCMSImage
              media={image.value}
              alt={props.option.label}
              class="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  },
});
export default component;
