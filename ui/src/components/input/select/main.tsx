import {
  computed,
  defineComponent,
  onMounted,
  type PropType,
  ref,
  type ComponentPublicInstance,
} from 'vue';
import type { BCMSSelectOption } from '../../../types';
import BCMSIcon from '../../icon';
import InputWrapper from '../_input';
import { DefaultComponentProps } from '../../_default';
import BCMSSelectList from './list';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: String,
    placeholder: String,
    invalidText: String,
    helperText: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: String,
      default: '',
    },
    options: {
      type: Array as PropType<BCMSSelectOption[]>,
      default: () => [],
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    propPath: String,
  },
  emits: {
    change: (_option: BCMSSelectOption) => {
      return true;
    },
  },
  setup(props, ctx) {
    const bcmsDropdownList = ref<ComponentPublicInstance | null>(null);
    const search = ref('');
    const searchInput = ref<HTMLInputElement | null>(null);
    const toggler = ref<HTMLButtonElement | null>(null);
    const position = ref<{ bottom: number }>({
      bottom: -10,
    });
    const container = ref<HTMLElement | null>(null);

    const filteredOptions = computed<BCMSSelectOption[]>(() => {
      if (!props.showSearch) {
        return props.options;
      }
      return props.options.filter((option) =>
        search.value
          ? option.value.toLowerCase().includes(search.value) ||
            option.label.toLowerCase().includes(search.value)
          : true,
      );
    });
    const isDropdownActive = ref(false);
    const logic = {
      handleSearchInput(event: Event) {
        const element = event.target as HTMLInputElement;
        if (!element) {
          return;
        }
        const value = element.value;
        if (!props.showSearch) {
          logic.scrollSearchedElementIntoView(value);
        } else {
          search.value = value.toLowerCase();
        }
      },
      scrollSearchedElementIntoView(value: string) {
        if (!bcmsDropdownList.value) {
          return;
        }

        const options = Array.from(
          bcmsDropdownList.value.$el.querySelectorAll('li'),
        ) as HTMLLIElement[];
        if (!options) {
          return;
        }
        options.forEach((option) => {
          const optionText = option.textContent?.toLowerCase();
          if (optionText && optionText.includes(value.toLowerCase())) {
            option.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        });

        if (!value) {
          bcmsDropdownList.value.$el.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      },
      toggleDropdown() {
        isDropdownActive.value = !isDropdownActive.value;
        if (isDropdownActive.value && !props.showSearch) {
          window.addEventListener('keydown', eventListeners);
          if (searchInput.value) {
            searchInput.value.focus();
          }
        } else {
          window.removeEventListener('keydown', eventListeners);
          search.value = '';
        }
      },
      getPlaceholderText(_selected: string) {
        if (!_selected) {
          return props.placeholder;
        }
        const selectedOption = props.options.find((e) => e.value === _selected);
        if (!selectedOption) {
          return props.placeholder;
        }
        return selectedOption.label
          ? selectedOption.label
          : selectedOption.value;
      },
      isItemSelected(item: BCMSSelectOption) {
        return item.value === props.selected;
      },
    };
    function eventListeners(event: KeyboardEvent) {
      const dropDown = {
        root: bcmsDropdownList.value?.$el,
        active:
          (bcmsDropdownList.value?.$el.querySelector(
            'li:focus',
          ) as HTMLLIElement) ||
          (bcmsDropdownList.value?.$el.querySelector(
            'li.selected',
          ) as HTMLLIElement),
        firstItem: bcmsDropdownList.value?.$el.querySelector(
          'li:first-child',
        ) as HTMLLIElement,
        lastItem: bcmsDropdownList.value?.$el.querySelector(
          'li:last-child',
        ) as HTMLLIElement,
      };

      switch (event.key) {
        case 'Escape': // 'ESC' - Close dropdown
          event.preventDefault();
          logic.toggleDropdown();
          break;

        case 'ArrowUp': // 'ARROW UP' - Move up
          event.preventDefault();
          if (!dropDown.active || !dropDown.active.previousElementSibling) {
            if (dropDown.lastItem) {
              dropDown.lastItem.focus();
            }
          } else {
            const prevSibl = dropDown.active.previousSibling as HTMLLIElement;
            prevSibl.focus();
          }
          break;

        case 'ArrowDown': // 'ARROW DOWN' - Move down
          event.preventDefault();
          if (!dropDown.active || !dropDown.active.nextElementSibling) {
            if (dropDown.firstItem) {
              dropDown.firstItem.focus();
            }
          } else {
            const nextSibling = dropDown.active.nextSibling as HTMLLIElement;
            nextSibling.focus();
          }
          break;

        default:
          break;
      }
    }

    onMounted(() => {
      if (searchInput.value && props.showSearch) {
        searchInput.value.focus();
      }
    });

    return () => {
      return (
        <InputWrapper
          class={`${props.class} w-full max-w-full relative`}
          label={props.label}
          invalidText={props.invalidText}
          helperText={props.helperText}
          containerRef={container}
        >
          <div
            data-bcms-prop-path={props.propPath}
            id={props.id}
            v-cy={props.cyTag}
            class={`inline-block border-b border-grey border-opacity-50 transition-all duration-300 mt-2.5 max-w-full ${
              props.showSearch ? 'relative' : 'mb-6 sr-only'
            } focus-within:border-pink dark:focus-within:border-yellow`}
          >
            <BCMSIcon
              src="/search"
              class="absolute top-1/2 left-0 -translate-y-1/2 w-4 mr-2.5 text-grey text-opacity-50 fill-current dark:text-light"
            />
            <input
              ref={searchInput}
              type="text"
              placeholder="Search"
              class="focus:outline-none w-[500px] max-w-full pt-3 pb-2 pl-7.5 text-sm bg-white placeholder-grey dark:bg-darkGrey dark:text-light"
              onKeyup={logic.handleSearchInput}
            />
          </div>
          {!props.showSearch && (
            <button
              id={'' + props.id}
              v-cy={props.cyTag}
              aria-haspopup="listbox"
              aria-labelledby="bcmsSelect_label bcmsSelect_button"
              type="button"
              class={`bg-white w-full h-11 justify-between rounded-3.5 py-1.5 pl-5 text-base leading-normal -tracking-0.01 whitespace-normal no-underline border shadow-none select-none flex items-center transition-all duration-300 hover:shadow-input focus:shadow-input active:shadow-input disabled:cursor-not-allowed disabled:opacity-50 disabled:border-grey disabled:border-opacity-50 disabled:hover:shadow-none ${
                props.showSearch ? 'pr-2.5' : 'pr-5'
              } ${
                props.invalidText
                  ? 'border border-red hover:border-red focus-within:border-red'
                  : 'border-grey hover:border-grey hover:border-opacity-50 focus:border-grey active:border-grey focus:border-opacity-50 active:border-opacity-50'
              } dark:bg-darkGrey dark:text-light`}
              onClick={() => {
                logic.toggleDropdown();
              }}
              disabled={props.disabled}
              ref={toggler}
            >
              <span
                class={`pr-3.5 whitespace-nowrap overflow-hidden pointer-events-none relative overflow-ellipsis z-10 ${
                  !props.selected ? 'text-grey' : ''
                }`}
              >
                {logic.getPlaceholderText(props.selected)}
              </span>
              <div
                class={`transition-transform duration-300 ${
                  isDropdownActive.value && !props.disabled
                    ? 'transform -rotate-180'
                    : ''
                }`}
              >
                <BCMSIcon
                  src="/chevron/down"
                  class={`text-grey fill-current w-3 block right-0 relative top-0 flex-shrink-0 pointer-events-none transition-transform duration-300`}
                />
              </div>
            </button>
          )}
          {(isDropdownActive.value || props.showSearch) &&
          !props.disabled &&
          !props.showSearch ? (
            <div
              class={`absolute z-[10000000] w-full py-2`}
              v-clickOutside={() => {
                isDropdownActive.value = false;
              }}
              style={`bottom: ${position.value.bottom}px;`}
            >
              <BCMSSelectList
                ref={bcmsDropdownList}
                inputRef={toggler}
                options={filteredOptions.value}
                selected={props.selected}
                invalidText={props.invalidText}
                showSearch={props.showSearch}
                onChange={(payload: BCMSSelectOption) => {
                  ctx.emit('change', payload);
                  isDropdownActive.value = false;
                }}
                onHide={() => {
                  isDropdownActive.value = false;
                }}
              />
            </div>
          ) : (isDropdownActive.value || props.showSearch) &&
            !props.disabled &&
            props.showSearch ? (
            <BCMSSelectList
              ref={bcmsDropdownList}
              options={filteredOptions.value}
              selected={props.selected}
              invalidText={props.invalidText}
              showSearch={props.showSearch}
              inputRef={container}
              onChange={(payload: BCMSSelectOption) => {
                ctx.emit('change', payload);
                isDropdownActive.value = false;
              }}
              v-clickOutside={() => {
                isDropdownActive.value = false;
              }}
            />
          ) : (
            ''
          )}
        </InputWrapper>
      );
    };
  },
});
export default component;
