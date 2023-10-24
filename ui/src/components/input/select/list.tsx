import {
  type CSSProperties,
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
  type Ref,
  Teleport,
  computed,
  nextTick,
} from 'vue';
import * as uuid from 'uuid';
import type { BCMSSelectOption } from '../../../types';
import { BCMSIcon } from '@ui/components';
import { textHighlight } from '@ui/util';

const component = defineComponent({
  props: {
    inputRef: Object as PropType<Ref<HTMLElement | null>>,
    options: {
      type: Array as PropType<BCMSSelectOption[]>,
      required: true,
    },
    showSearch: {
      type: Boolean,
      required: false,
      default: false,
    },
    invalidText: {
      type: String,
      required: false,
      default: '',
    },
    selected: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },
    multiple: {
      type: Boolean,
      required: false,
    },
  },
  emits: {
    change: (_option: BCMSSelectOption) => {
      return true;
    },
    hide: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const scrollerId = uuid.v4();
    const container = ref<HTMLElement>();
    const positionStyles = ref<CSSProperties>({
      top: '0 !important',
      left: '0 !important',
      width: '100px !important',
      maxHeight: '250px !important',
    });

    const searchVal = ref('');
    const searchInput = ref<HTMLInputElement | null>(null);

    const logic = {
      isItemSelected(option: BCMSSelectOption) {
        if (props.multiple) {
          return props.selected.includes(option.value);
        } else {
          return option.value === props.selected[0];
        }
      },
      selectOption(option: BCMSSelectOption) {
        if (props.multiple) {
          if (props.selected.includes(option.value)) {
            const removeIndex = props.selected.indexOf(option.value);

            ctx.emit('change', {
              label: '',
              value: '',
              index: removeIndex,
            });
          } else {
            ctx.emit('change', option);
          }
        } else {
          if (option.value === props.selected[0]) {
            ctx.emit('change', {
              label: '',
              value: '',
              index: 0,
            });
          } else {
            ctx.emit('change', option);
          }
        }
      },
      updatePosition() {
        if (props.inputRef) {
          const parentEl = props.inputRef.value;
          if (parentEl && container.value) {
            const bb = parentEl.getBoundingClientRect();
            if (
              bb.bottom + 10 + container.value.offsetHeight >
              window.innerHeight
            ) {
              positionStyles.value.top = `${
                bb.top - 10 - container.value.offsetHeight
              }px !important`;
              positionStyles.value.maxHeight = `${bb.top - 40}px !important`;
            } else {
              positionStyles.value.top = `${bb.bottom + 10}px !important`;
              positionStyles.value.maxHeight = `${
                window.innerHeight - bb.bottom - 40
              }px !important`;
            }
            positionStyles.value.width = `${parentEl.clientWidth}px !important`;
            positionStyles.value.left = `${bb.left}px !important`;
          }
        }
      },
      findScrollableEls(from: HTMLElement) {
        if (from.scrollHeight > from.offsetHeight) {
          scrollableParents.push(from);
        }
        if (from.parentElement) {
          logic.findScrollableEls(from.parentElement);
        }
      },
    };

    nextTick(() => {
      logic.updatePosition();
    });

    const filteredOptions = computed(() => {
      if (!props.multiple) return props.options;

      return props.options
        .filter((option) => {
          return `${option.label} ${option.subtitle || ''}`
            .toLowerCase()
            .includes(searchVal.value.toLowerCase());
        })
        .map((option) => {
          const highlightedLabel = textHighlight(option.label, searchVal.value);
          const highlightedSubtitle = textHighlight(
            option.subtitle || '',
            searchVal.value,
          );

          return {
            ...option,
            label: highlightedLabel,
            subtitle: highlightedSubtitle,
          };
        });
    });

    const scrollableParents: HTMLElement[] = [];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            ctx.emit('hide');
          }
        });
      },
      {
        threshold: 0.5,
      },
    );

    const scrollToSelectedOptionElement = () => {
      // If there is a selected element, scroll to it
      // but keep it on the second place
      // for better UX
      if (container.value && props.selected) {
        const selectedElement = container.value.querySelector(
          `[data-bcms-value="${props.selected}"]`,
        );
        if (selectedElement) {
          selectedElement.scrollIntoView();
          container.value.scrollBy({
            top: -selectedElement.clientHeight,
          });
        }
      }
    };

    onMounted(() => {
      if (props.inputRef && props.inputRef.value) {
        obs.observe(props.inputRef.value);

        logic.findScrollableEls(props.inputRef.value);
        for (let i = 0; i < scrollableParents.length; i++) {
          const element = scrollableParents[i];
          element.addEventListener('scroll', logic.updatePosition);
        }
      }
      logic.updatePosition();
      scrollToSelectedOptionElement();
      if (props.multiple) {
        searchInput.value?.focus();
      }
    });

    onUnmounted(() => {
      if (props.inputRef && props.inputRef.value) {
        obs.unobserve(props.inputRef.value);
      }
      for (let i = 0; i < scrollableParents.length; i++) {
        const element = scrollableParents[i];
        element.removeEventListener('scroll', logic.updatePosition);
      }
    });

    return () => {
      return (
        <div>
          <Teleport to="#bcmsSelectList">
            <div
              class={`fixed w-full z-[1000000] left-0`}
              style={positionStyles.value}
            >
              {props.multiple && (
                <div class="relative z-[1000001] flex border-b border-grey border-opacity-50 transition-all duration-300 w-full rounded-t-2.5 mt-px overflow-hidden focus-within:border-pink dark:focus-within:border-yellow">
                  <BCMSIcon
                    src="/search"
                    class="absolute top-1/2 left-4 -translate-y-1/2 w-4 mr-2.5 text-grey text-opacity-50 fill-current dark:text-light"
                  />
                  <input
                    ref={searchInput}
                    v-model={searchVal.value}
                    type="search"
                    placeholder="Search"
                    class="w-full flex-1 pt-3.5 pb-2.5 pl-10 text-sm bg-white placeholder-grey dark:bg-darkGrey dark:text-light focus:outline-none"
                  />
                </div>
              )}
              <ul
                id={scrollerId}
                ref={container}
                tabindex="-1"
                role="listbox"
                aria-labelledby="bcmsSelect_label"
                class={`bcmsScrollbar fixed min-w-[150px] list-none w-full bg-white border border-grey border-opacity-20 z-[1000000] rounded-2.5 transition-shadow duration-300 left-0 overflow-auto shadow-cardLg dark:bg-darkGrey
                ${props.showSearch ? 'border-none dark:border-solid' : ''}
                ${props.invalidText ? 'border-red' : ''}
                ${props.options.length === 0 ? 'hidden' : ''}
                ${props.multiple ? 'pt-12' : ''}
              `}
                style={positionStyles.value}
              >
                {filteredOptions.value.map((option) => (
                  <li
                    role="option"
                    aria-selected={logic.isItemSelected(option)}
                    tabindex="0"
                    class={`group relative cursor-pointer transition-colors duration-200 focus:outline-none ${
                      ctx.slots.option
                        ? ''
                        : 'py-2.5 text-dark flex items-center hover:bg-light focus:bg-light before:block dark:text-light dark:hover:bg-grey dark:focus:bg-grey'
                    } ${
                      logic.isItemSelected(option)
                        ? 'selected before:w-2.5 before:h-2.5 before:bg-yellow before:absolute before:rounded-full before:top-1/2 before:left-[-5px] before:-translate-y-1/2 hover:before:bg-red focus:before:bg-red'
                        : 'hover:before:w-2.5 hover:before:h-2.5 hover:before:bg-yellow hover:before:absolute hover:before:rounded-full hover:before:top-1/2 hover:before:left-[-5px] hover:before:-translate-y-1/2 focus:before:w-2.5 focus:before:h-2.5 focus:before:bg-yellow focus:before:absolute focus:before:rounded-full focus:before:top-1/2 focus:before:left-[-5px] focus:before:-translate-y-1/2'
                    } ${
                      !ctx.slots.option &&
                      (props.showSearch
                        ? 'pl-1 pr-4.5 before:hidden'
                        : 'px-4.5')
                    }`}
                    data-bcms-value={option.value}
                    onKeydown={(event) => {
                      if (event.key === 'Enter') {
                        logic.selectOption(option);
                      }
                    }}
                    onClick={() => {
                      logic.selectOption(option);
                    }}
                  >
                    {ctx.slots.option ? (
                      ctx.slots.option({ option })
                    ) : (
                      <>
                        {option.image ? (
                          <img
                            class="w-6 h-6 rounded-full mr-[15px]"
                            src={option.image}
                            alt="Flag"
                          />
                        ) : (
                          ''
                        )}
                        <span>{option.label || option.value}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Teleport>
        </div>
      );
    };
  },
});
export default component;
