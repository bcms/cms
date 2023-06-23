import { computed, defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '../_default';
import BCMSIcon from '../icon';
import type { BCMSPropValueExtended } from '../../types';
import {
  BCMSPropType,
  type BCMSPropValueGroupPointerData,
} from '@becomes/cms-sdk/types';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    prop: {
      type: Object as PropType<BCMSPropValueExtended>,
      required: true,
    },
  },
  emits: {
    removeGroup: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const wrapperClass = computed(() => {
      const cls: string[] = [];

      if (
        props.prop.array ||
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls.push(
          'border-green',
          'mb-10',
          'rounded-2.5',
          'border',
          'border-solid',
          'px-2.5',
          'pb-6',
          'relative',
          'border-t-0',
          'rounded-t-none',
          'sm:px-5',
          'dark:border-yellow',
        );
      }
      if (props.prop.type === BCMSPropType.MEDIA) {
        replaceArrayItem(cls, 'border-green', 'border-grey border-opacity-50');
      }
      if (props.prop.array) {
        cls.push('mx-0', 'mt-7.5', 'pt-9', 'last:mb-7.5');
      } else if (
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls.push('mt-2.5', 'pt-2', 'last:mb-2.5');
      }
      if (
        !props.prop.array &&
        !props.prop.required &&
        props.prop.type === BCMSPropType.GROUP_POINTER
      ) {
        cls.push('pt-5');
      }

      return cls.join(' ');
    });

    const wrapperHeaderClass = computed(() => {
      const cls: string[] = [];

      if (
        props.prop.array ||
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls.push(
          'absolute',
          '-top-2.5',
          '-left-px',
          'flex',
          'items-center',
          'justify-between',
          'before:w-2.5',
          'before:h-2.5',
          'before:absolute',
          'before:top-0',
          'before:left-0',
          'before:border-t',
          'before:border-l',
          'before:border-green',
          'before:rounded-tl-2.5',
          'after:w-2.5',
          'after:h-2.5',
          'after:absolute',
          'after:top-0',
          'after:-right-px',
          'after:border-t',
          'after:border-r',
          'after:border-green',
          'after:rounded-tr-2.5',
          'dark:before:border-yellow',
          'dark:after:border-yellow',
        );
      }
      if (props.prop.type === BCMSPropType.MEDIA) {
        replaceArrayItem(
          cls,
          'before:border-green',
          'before:border-grey before:border-opacity-50',
        );
        replaceArrayItem(
          cls,
          'after:border-green',
          'after:border-grey after:border-opacity-50',
        );
      }
      if (
        props.prop.array ||
        [
          BCMSPropType.GROUP_POINTER,
          BCMSPropType.ENTRY_POINTER,
          BCMSPropType.MEDIA,
        ].includes(props.prop.type)
      ) {
        cls.push('w-[calc(100%+2px)]');
      }

      return cls.join(' ');
    });

    const wrapperInnerClass = computed(() => {
      let cls = '';

      if (
        props.prop.array ||
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls += 'border-none ';
      }
      return cls;
    });

    const wrapperDetailsClass = computed(() => {
      const cls: string[] = [];

      if (
        props.prop.array ||
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls.push(
          'pl-4',
          'pr-3.5',
          'translate-x-0',
          'translate-y-[-7.1px]',
          props.prop.type === BCMSPropType.MEDIA ? 'text-grey' : 'text-green',
          showGroupPointerRemoveButton() ? 'w-[calc(100%-32px)]' : '',
          'after:relative',
          'after:top-1/2',
          'after:flex-grow',
          'after:h-px',
          props.prop.type === BCMSPropType.MEDIA
            ? 'after:bg-grey after:bg-opacity-50'
            : 'after:bg-green',
          'after:translate-x-1',
          'after:-translate-y-0.5',
          'dark:after:bg-yellow',
          'after:w-[100px]',
        );
        if (
          props.prop.type === BCMSPropType.GROUP_POINTER &&
          !props.prop.required &&
          !props.prop.array
        ) {
          // cls.push('translate-y-[-16px]');
        }
      }

      return cls.join(' ');
    });

    const wrapperLabelClass = computed(() => {
      let cls = '';

      if (
        props.prop.array ||
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls += 'text-inherit';
      }

      return cls;
    });

    const wrapperRequiredClass = computed(() => {
      let cls = '';

      if (
        props.prop.array ||
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls += 'text-green dark:text-yellow';
      }
      if (props.prop.type === BCMSPropType.MEDIA) {
        cls = 'text-grey';
      }

      return cls;
    });

    const wrapperBodyClass = computed(() => {
      const cls: string[] = [];

      if (
        props.prop.type === BCMSPropType.GROUP_POINTER ||
        props.prop.type === BCMSPropType.MEDIA
      ) {
        cls.push('mt-0 pb-0');
      } else if (
        props.prop.type === BCMSPropType.ENTRY_POINTER &&
        props.prop.array
      ) {
        cls.push('pb-4 mt-0');
      } else if (props.prop.array && (props.prop.data as string[]).length > 0) {
        cls.push('pb-0 mt-5');
      } else {
        cls.push('pb-4 mt-5');
      }

      return cls.join(' ');
    });

    function showGroupPointerRemoveButton() {
      return (
        props.prop.type === BCMSPropType.GROUP_POINTER &&
        !props.prop.required &&
        !props.prop.array &&
        (props.prop.data as BCMSPropValueGroupPointerData).items[0]
      );
    }
    function replaceArrayItem(arr: string[], src: string, target: string) {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item === src) {
          arr[i] = target;
          break;
        }
      }
    }

    return () => (
      <div
        v-cy={props.cyTag}
        class={`entryEditor--prop_${
          props.prop.type === BCMSPropType.MEDIA
            ? BCMSPropType.GROUP_POINTER
            : props.prop.type
        } ${props.class} ${wrapperClass.value}`}
        style={props.style}
      >
        <div class={`w-full ${wrapperHeaderClass.value}`}>
          <div
            class={`flex items-start pb-1.5 border-b border-grey border-opacity-50 relative w-full justify-between ${wrapperInnerClass.value}`}
          >
            <div
              class={`flex items-center relative w-full ${wrapperDetailsClass.value}`}
            >
              <div
                class={`text-xs leading-normal tracking-0.06 uppercase flex-grow-0 mr-1 flex-shrink-0 max-w-full truncate ${
                  wrapperLabelClass.value || 'text-dark'
                } dark:text-light dark:after:bg-yellow`}
              >
                {props.prop.label}
              </div>
              {props.prop.required ? (
                <BCMSIcon
                  class={`w-3.5 h-3.5 fill-current ${
                    wrapperRequiredClass.value || 'text-grey'
                  }`}
                  src="/lock"
                />
              ) : (
                ''
              )}
            </div>
            {showGroupPointerRemoveButton() ? (
              <button
                class="p-1.25"
                onClick={() => {
                  ctx.emit('removeGroup');
                }}
              >
                <span
                  class={`flex ${
                    !props.prop.array &&
                    props.prop.type === BCMSPropType.GROUP_POINTER
                      ? 'text-green dark:text-yellow'
                      : 'text-pink'
                  } ${
                    !props.prop.array &&
                    props.prop.type === BCMSPropType.GROUP_POINTER &&
                    !props.prop.required
                      ? '-translate-x-2 -translate-y-4'
                      : ''
                  }`}
                >
                  <BCMSIcon src="/trash" class="w-6 h-6 block fill-current" />
                </span>
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
        <div class={`${wrapperBodyClass.value}`}>
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </div>
    );
  },
});
export default component;
