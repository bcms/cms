import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onUnmounted,
  type PropType,
  Transition,
} from 'vue';
import BCMSIcon from '../icon';
import { useTranslation } from '../../translations';
import BCMSButton from '../button';

const component = defineComponent({
  props: {
    class: String,
    show: {
      type: Boolean,
      required: true,
    },
    title: String,
    actionName: String,
    beforeDone: Function as PropType<() => boolean>,
    doNotShowFooter: Boolean,
    allowBodyScroll: {
      type: Boolean,
      default: true,
    },
    confirmButtonKind: {
      type: String as PropType<
        'primary' | 'secondary' | 'alternate' | 'ghost' | 'danger'
      >,
      required: false,
    },
    confirmDisabledButton: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: {
    done: (_?: unknown) => {
      return true;
    },
    cancel: (_?: unknown) => {
      return true;
    },
    scroll: (_event: UIEvent) => {
      return true;
    },
  },

  setup(props, ctx) {
    let escUnsub: () => void = () => {
      // Nothing
    };
    const translations = computed(() => {
      return useTranslation();
    });

    function cancel() {
      ctx.emit('cancel');
    }
    function done() {
      if (props.beforeDone) {
        if (!props.beforeDone()) {
          return;
        }
      }
      ctx.emit('done');
    }

    // window.addEventListener('keyup', (event) => {
    //   if (props.show) {
    //     if (event.key === 'Enter') {
    //       ctx.emit('done');
    //     } else if (event.key === 'Escape') {
    //       ctx.emit('cancel');
    //     }
    //   }
    // });

    onBeforeUpdate(() => {
      if (props.show) {
        document.body.style.overflowY = 'hidden';
      } else {
        document.body.style.overflowY = 'auto';
      }
    });

    // function handlerEscape() {
    //   setTimeout(() => {
    //     escUnsub = window.bcms.modal.escape.register(handlerEscape);
    //   }, 100);
    //   cancel();
    // }

    onBeforeUpdate(() => {
      if (props.show) {
        escUnsub = window.bcms.modal.escape.register(cancel);
      } else {
        escUnsub();
      }
    });
    onUnmounted(() => {
      escUnsub();
    });

    return () => {
      return (
        <Transition name="modal" mode="out-in">
          {props.show && (
            <div
              data-bcms-info="modal"
              class={`bcmsModal fixed flex items-center justify-center top-0 left-0 w-full h-full z-1000000 ${
                props.class ? props.class : ''
              }`}
            >
              <div
                aria-label="Close modal"
                class="bcmsModal--overlay absolute w-full h-full bg-dark bg-opacity-30 cursor-pointer transition-all duration-200 focus:after:content-[attr(aria-label)] focus:after:absolute focus:after:top-5 focus:after:right-5 focus:after:text-base focus:after:leading-normal focus:after:rounded focus:after:py-1 focus:after:px-2 z-0"
                tabindex="0"
                role="button"
                onKeydown={(event) => {
                  if (event.key === 'Enter') {
                    cancel();
                  }
                }}
                onClick={() => {
                  cancel();
                }}
              />
              <div class="bcmsModal--inner relative w-[95%] max-w-[500px] rounded-2.5 bg-white shadow-cardLg z-10 max-h-[90vh] pb-0 flex flex-col duration-300 transition-all dark:bg-darkGrey">
                <header class="bcmsModal--header pt-7.5 px-7.5 flex items-start justify-between leading-none mb-12 xs:pt-10 xs:px-10">
                  {ctx.slots.header ? (
                    ctx.slots.header()
                  ) : props.title ? (
                    <div class="text-dark text-4xl -tracking-0.03 font-normal line-break-anywhere w-full dark:text-light">
                      {props.title}
                    </div>
                  ) : (
                    ''
                  )}
                  <button
                    aria-label="Close modal"
                    onClick={cancel}
                    class="bcmsModal--close group ml-auto pt-[5px]"
                  >
                    <BCMSIcon
                      src="/close"
                      class="w-6 h-6 transition-all duration-200 fill-current text-dark group-hover:text-red group-focus:text-red dark:text-light"
                    />
                  </button>
                </header>
                <div
                  data-bcms-info="modal_body"
                  class={`bcmsModal--body ${
                    props.allowBodyScroll
                      ? 'overflow-y-auto overflow-x-hidden'
                      : ''
                  } px-7.5 bcmsScrollbar xs:px-10 flex flex-col`}
                  onScroll={(event) => {
                    ctx.emit('scroll', event);
                  }}
                >
                  {ctx.slots.default ? ctx.slots.default() : ''}
                </div>
                {props.doNotShowFooter ? (
                  ''
                ) : (
                  <div class="bcmsModal--actions flex flex-row-reverse items-center pb-7.5 px-7.5 pt-10 rounded-b-2.5 xs:pb-10 xs:px-10">
                    {ctx.slots.actions ? (
                      ctx.slots.actions()
                    ) : (
                      <>
                        <BCMSButton
                          onClick={done}
                          disabled={props.confirmDisabledButton}
                          kind={props.confirmButtonKind}
                        >
                          <span>
                            {props.actionName
                              ? props.actionName
                              : translations.value.modal.actions.done}
                          </span>
                        </BCMSButton>
                        <BCMSButton kind="ghost" onClick={cancel}>
                          {translations.value.modal.actions.cancel}
                        </BCMSButton>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Transition>
      );
    };
  },
});

export default component;
