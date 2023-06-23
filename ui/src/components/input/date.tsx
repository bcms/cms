import { computed, defineComponent, onMounted } from 'vue';
import { DefaultComponentProps } from '../_default';
import InputWrapper from './_input';
import BCMSIcon from '../icon';
import { BCMSPropType } from '@becomes/cms-sdk/types';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    value: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    invalidText: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    includeTime: {
      type: Boolean,
      default: false,
    },
    helperText: {
      type: String,
      default: '',
    },
    propPath: String,
  },
  emits: {
    input: (_value: number) => {
      return true;
    },
    enter: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const dateAsString = computed(() => {
      return props.value ? toDate(props.value) : toDate(Date.now());
    });

    function toDate(millis: number): string {
      const date = new Date(millis);
      return `${date.getFullYear()}-${
        date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1
      }-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
    }
    function handlerInput(event: Event) {
      const element = event.target as HTMLInputElement;
      const value = !element.valueAsNumber ? 0 : element.valueAsNumber;
      ctx.emit('input', value);
      if ((event as KeyboardEvent).key === 'Enter') {
        ctx.emit('enter');
      }
    }

    onMounted(() => {
      if (!props.value) {
        ctx.emit('input', Date.now());
      }
    });

    return () => (
      <InputWrapper
        class={props.class}
        label={props.label}
        invalidText={props.invalidText}
        helperText={props.helperText}
      >
        <div
          v-cy={props.cyTag}
          class={`_bcmsInput--date items-center ${
            props.includeTime ? 'block sm:flex' : 'flex'
          }`}
        >
          {/* <div
            class={`relative flex items-center justify-center ${
              props.includeTime
                ? 'w-full border border-r border-grey border-opacity-100 rounded-3.5 mb-2.5 hover:border-opacity-50 focus-within:border-opacity-50 transition-colors duration-300 sm:mb-0 sm:rounded-r-none sm:w-2/3'
                : 'w-full'
            }`}
          > */}
          <div
            class={`relative flex date w-full bg-white border transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
              props.invalidText
                ? 'border-red hover:border-red focus-within:border-red'
                : 'border-grey hover:border-grey hover:border-opacity-50 focus-within:border-grey focus-within:border-opacity-50'
            } ${!props.includeTime && props.invalidText ? '' : 'pr-2'} ${
              props.disabled
                ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                : 'cursor-auto'
            } ${
              props.includeTime
                ? 'border-none rounded-3.5 sm:rounded-r-none'
                : 'rounded-3.5'
            } dark:bg-darkGrey dark:text-light`}
          >
            <input
              data-bcms-prop-path={props.propPath}
              data-bcms-prop-type={BCMSPropType.DATE}
              id={props.label}
              class={`text-dark bg-white dark:text-light dark:bg-darkGrey placeholder-grey outline-none`}
              type="date"
              value={dateAsString.value}
              disabled={props.disabled}
              onChange={(event) => {
                handlerInput(event);
              }}
              onKeyup={(event) => {
                handlerInput(event);
              }}
            />
            <button
              aria-label="Reset date"
              title="Reset date"
              class="relative group bg-white flex z-10 dark:bg-darkGrey ml-auto mt-auto"
              disabled={props.disabled}
              onClick={() => {
                ctx.emit('input', 0);
              }}
            >
              <BCMSIcon
                src="/close"
                class="pb-[5px] text-dark text-opacity-50 fill-current w-6 h-6 m-auto transition-all duration-200 group-hover:text-red group-hover:text-opacity-100 group-focus:text-red group-focus:text-opacity-100 dark:text-light"
              />
            </button>
          </div>
          {props.includeTime ? (
            <div
              class={`relative flex items-center justify-center ${
                props.includeTime
                  ? 'w-full border border-r border-grey border-opacity-100 rounded-3.5 hover:border-opacity-50 focus-within:border-opacity-50 transition-colors duration-300 sm:rounded-l-none sm:w-1/3'
                  : 'w-full'
              }`}
            >
              <input
                class={`time relative block w-full bg-white border transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden sm:pl-2 hover:shadow-input focus-within:shadow-input ${
                  props.invalidText
                    ? 'border-red hover:border-red focus-within:border-red'
                    : 'border-grey hover:border-grey hover:border-opacity-50 focus-within:border-grey focus-within:border-opacity-50'
                } ${props.includeTime && props.invalidText ? '' : 'pr-2'} ${
                  props.disabled
                    ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                    : 'cursor-auto'
                } ${
                  props.includeTime
                    ? 'border-none rounded-3.5 sm:rounded-l-none'
                    : 'rounded-3.5'
                } dark:bg-darkGrey dark:text-light`}
                disabled={props.disabled}
                type="time"
              />
              <button
                aria-label="Reset date"
                title="Reset date"
                disabled={props.disabled}
                class="group absolute top-2.5 right-[5px] bg-white flex z-10 dark:bg-darkGrey"
              >
                <BCMSIcon
                  src="/close"
                  class="text-dark text-opacity-50 fill-current w-6 h-6 m-auto transition-all duration-200 group-hover:text-red group-hover:text-opacity-100 group-focus:text-red group-focus:text-opacity-100 dark:text-light"
                />
              </button>
            </div>
          ) : (
            ''
          )}
        </div>
      </InputWrapper>
    );
  },
});
export default component;
