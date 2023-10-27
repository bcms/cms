import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  Transition,
} from 'vue';
import { BCMSHelpItem } from '.';
import { useTranslation } from '../../../translations';
import { DefaultComponentProps } from '../../_default';
import { BCMSTimestampDisplay } from '../..';
import { useRoute } from 'vue-router';
import type { BCMSTranslationsFooterDocsKeyNames } from '../../../types';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
  },
  setup(props) {
    const route = useRoute();
    props = reactive(props);
    const translations = computed(() => {
      return useTranslation();
    });
    const helpContainer = ref<HTMLDivElement | null>(null);
    const show = ref(false);
    const toggler = ref<HTMLButtonElement | null>(null);

    function handleClick() {
      if (!show.value) {
        show.value = true;
      } else {
        show.value = false;
      }
    }

    function hide() {
      show.value = false;
    }

    const getManagerName = computed(() => {
      const pathSplit = route.path.split('/');
      let name = pathSplit[2];

      if (pathSplit[4] && pathSplit[4] === 'e') {
        name = pathSplit[4];
      }

      return name as BCMSTranslationsFooterDocsKeyNames;
    });

    let isMac = false;
    onMounted(() => {
      const platform =
        (navigator as any)?.userAgentData?.platform ||
        navigator?.platform ||
        'unknown';
      isMac = platform?.toLowerCase().includes('mac');
    });

    return () => {
      return (
        <div class={`help relative ${props.class || ''}`} v-cy={props.cyTag}>
          <button
            onClick={() => {
              handleClick();
            }}
            class="flex items-center justify-center w-8 h-8 text-lg transition-all duration-200 bg-white rounded-full help--btn group z-1000 dark:hover:bg-darkGrey dark:focus-visible:bg-darkGrey dark:bg-darkGrey"
            title={translations.value.layout.footer.help.toggleTitle}
            ref={toggler}
          >
            <span class="font-medium text-opacity-75 transition-colors duration-200 pointer-events-none text-dark group-hover:text-green group-focus:text-green dark:group-hover:text-yellow dark:group-focus:text-yellow dark:text-light">
              ?
            </span>
          </button>
          <Transition name="help">
            {show.value === true && (
              <div
                class="help--container absolute top-0 left-0 -translate-x-full -translate-y-full min-w-max max-h-[80vh] overflow-y-auto bg-white rounded-2.5 py-1.5 dark:bg-darkGrey dark:border dark:border-grey dark:border-opacity-20"
                ref={helpContainer}
                v-clickOutside={() => (show.value = false)}
              >
                {translations.value.layout.footer.help
                  .navigation(getManagerName.value)
                  .sort((a, b) => a.level - b.level)
                  .map((item, index) => {
                    const nextItemLevel =
                      translations.value.layout.footer.help.navigation(
                        getManagerName.value,
                      )[index + 1];
                    return (
                      <>
                        <BCMSHelpItem
                          {...item}
                          isMac={isMac}
                          onClick={() => hide()}
                        />
                        {nextItemLevel && item.level < nextItemLevel.level && (
                          <div class="h-px my-0.5 bg-grey bg-opacity-30" />
                        )}
                      </>
                    );
                  })}
                <div class="h-px my-0.5 bg-grey bg-opacity-30" />
                <BCMSHelpItem tag="div" title="BCMS 2.9.17" level={4} />
                <BCMSHelpItem tag="div" level={4} class="inline-block">
                  <span>{translations.value.layout.footer.help.updated} </span>
                  <BCMSTimestampDisplay timestamp={Date.now() - 120000} />
                </BCMSHelpItem>
              </div>
            )}
          </Transition>
        </div>
      );
    };
  },
});
export default component;
