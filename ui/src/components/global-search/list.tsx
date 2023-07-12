import { computed, defineComponent, type PropType, type Ref } from 'vue';
import { useTranslation } from '../../translations';
import type { BCMSGlobalSearchItem } from '../../types';
import Link from '../link';

const component = defineComponent({
  props: {
    results: {
      type: Array as PropType<BCMSGlobalSearchItem[]>,
      required: true,
    },
    list: {
      type: Object as PropType<Ref<HTMLUListElement | null>>,
      required: true,
    },
  },
  emits: {
    hide: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });

    const userResults = computed(() => {
      return props.results.filter((e) => e.kind === 'User');
    });

    return () => (
      <ul ref={props.list} class="bcmsScrollbar max-h-[470px] overflow-y-auto">
        {props.results.length > 0 ? (
          <>
            {props.results
              .filter((e) => e.kind !== 'User')
              .map((item, index) => {
                return (
                  <li class="flex group globalSearch--result-item">
                    <Link
                      href={item.url}
                      class="w-full px-10 transition-all duration-300 group hover:bg-light focus-visible:bg-light focus:outline-none dark:hover:bg-grey dark:focus-visible:bg-grey dark:bg-opacity-30"
                      onClick={() => ctx.emit('hide')}
                    >
                      <div
                        class={`py-[13px] flex items-center justify-between w-full border-dark border-opacity-10 dark:border-grey dark:border-opacity-50 ${
                          index === props.results.length - 1
                            ? 'border-none'
                            : 'border-b'
                        }`}
                      >
                        <div class="flex items-center">
                          <span class="text-sm -tracking-0.01 leading-none text-light text-center rounded-md px-2.5 py-2 bg-grey w-20 mr-6 transition-all duration-300 group-hover:bg-green group-focus-visible:bg-green dark:group-hover:bg-yellow dark:group-focus-visible:bg-yellow dark:group-hover:text-dark dark:group-focus-visible:text-dark">
                            {item.kind}
                          </span>
                          <span
                            class="leading-tight -tracking-0.01 transition-colors duration-300 dark:text-white dark:group-hover:text-dark dark:group-focus-visible:text-dark"
                            v-html={item.label}
                          />
                        </div>
                        <span class="text-green -tracking-0.01 leading-normal opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-yellow">
                          {translations.value.modal.globalSearch.open}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            {userResults.value.length > 0 && (
              <li class="mt-3">
                <span class="text-xs leading-normal tracking-0.06 uppercase font-medium text-grey px-10 mb-2.5">
                  {translations.value.modal.globalSearch.members}
                </span>
                <ul>
                  {userResults.value.map((item) => {
                    return (
                      <li class="flex globalSearch--result-item">
                        <Link
                          href={item.url}
                          class="group w-full flex items-center justify-between px-10 py-[13px] transition-all duration-300 hover:bg-light focus-visible:bg-light focus:outline-none dark:hover:bg-grey dark:focus-visible:bg-grey"
                          onClick={() => ctx.emit('hide')}
                        >
                          <div class="flex items-center">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.label}
                                class="w-5 h-5 mr-1.5 object-contain rounded-full"
                              />
                            )}
                            <span class="leading-tight -tracking-0.01 dark:text-light">
                              {item.label}
                            </span>
                          </div>
                          <span class="text-green -tracking-0.01 leading-normal opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-yellow">
                            {translations.value.modal.globalSearch.open}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}
          </>
        ) : (
          ''
        )}
      </ul>
    );
  },
});
export default component;
