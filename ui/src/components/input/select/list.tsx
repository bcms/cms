import {
  type CSSProperties,
  defineComponent,
  onMounted,
  onUnmounted,
  type PropType,
  ref,
  type Ref,
  Teleport,
} from 'vue';
import * as uuid from 'uuid';
import type { BCMSSelectOption } from '../../../types';

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
      type: String,
      required: false,
      default: '',
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
    });

    const logic = {
      isItemSelected(option: BCMSSelectOption) {
        return option.value === props.selected;
      },
      selectOption(option: BCMSSelectOption) {
        if (option.value === props.selected) {
          ctx.emit('change', { label: '', value: '' });
        } else {
          ctx.emit('change', option);
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
            } else {
              positionStyles.value.top = `${bb.bottom + 10}px !important`;
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
    logic.updatePosition();
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
        threshold: 1,
      }
    );

    const scrollToSelectedOptionElement = () => {
      // If there is a selected element, scroll to it
      // but keep it on the second place
      // for better UX
      if (container.value && props.selected) {
        const selectedElement = container.value.querySelector(
          `[data-bcms-value="${props.selected}"]`
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
            <ul
              id={scrollerId}
              ref={container}
              tabindex="-1"
              role="listbox"
              aria-labelledby="bcmsSelect_label"
              class={`bcmsScrollbar fixed max-h-[200px] min-w-[150px] list-none w-full bg-white border border-grey border-opacity-20 z-[1000000] rounded-2.5 transition-shadow duration-300 left-0 overflow-auto shadow-cardLg dark:bg-darkGrey
                ${props.showSearch ? 'border-none dark:border-solid' : ''}
                ${props.invalidText ? 'border-red' : ''}
                ${props.options.length === 0 ? 'hidden' : ''}
              `}
              style={positionStyles.value}
            >
              {props.options.map((option) => (
                <li
                  role="option"
                  aria-selected={logic.isItemSelected(option)}
                  tabindex="0"
                  class={`py-2.5 before:block relative cursor-pointer text-dark transition-colors duration-200 flex items-center hover:bg-light focus:bg-light focus:outline-none ${
                    logic.isItemSelected(option)
                      ? 'selected before:w-2.5 before:h-2.5 before:bg-yellow before:absolute before:rounded-full before:top-1/2 before:left-[-5px] before:-translate-y-1/2 hover:before:bg-red focus:before:bg-red'
                      : 'hover:before:w-2.5 hover:before:h-2.5 hover:before:bg-yellow hover:before:absolute hover:before:rounded-full hover:before:top-1/2 hover:before:left-[-5px] hover:before:-translate-y-1/2 focus:before:w-2.5 focus:before:h-2.5 focus:before:bg-yellow focus:before:absolute focus:before:rounded-full focus:before:top-1/2 focus:before:left-[-5px] focus:before:-translate-y-1/2'
                  } ${
                    props.showSearch ? 'pl-1 pr-4.5 before:hidden' : 'px-4.5'
                  } dark:text-light dark:hover:bg-grey dark:focus:bg-grey`}
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
                </li>
              ))}
            </ul>
          </Teleport>
        </div>
      );
    };
  },
});
export default component;
