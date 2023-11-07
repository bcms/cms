import { defineComponent, type PropType, ref } from 'vue';
import { DefaultProps } from '../_default';
import { ModalService, ModalServiceType } from '../../services';
import { BCMSButton } from '@ui/components';

export interface ModalDone {
  (event?: Event): void | boolean | Promise<void | boolean>;
}

export interface ModalCancel {
  (event?: Event): void | boolean | Promise<void | boolean>;
}

export function createModalDoneFn(cb: ModalDone) {
  return cb;
}

export function createModalCancelFn(cb: ModalDone) {
  return cb;
}

export const Modal = defineComponent({
  props: {
    ...DefaultProps,
    childClass: String,
    modalName: {
      type: String as PropType<keyof ModalServiceType>,
      required: true,
    },
    title: String,
    description: String,
    header: Object as PropType<JSX.Element>,
    noHeader: Boolean,
    noFooter: Boolean,
    doneText: String,
    cancelText: String,
    onDone: Function as PropType<ModalDone>,
    onCancel: Function as PropType<ModalCancel>,
    triggerCancel: Function as PropType<
      (callback: (event?: Event) => void) => void
    >,
    triggerDone: Function as PropType<
      (callback: (event: Event) => void) => void
    >,
    width: [String, Number] as PropType<number | string | undefined>,
    hideDone: Boolean,
  },
  emits: {
    show: (_data: any) => {
      return true;
    },
    cancel: (_event?: Event) => {
      return true;
    },
    done: (_event?: Event) => {
      return true;
    },
  },
  setup(props, ctx) {
    const show = ref(false);

    ModalService[props.modalName].hide = () => {
      show.value = false;
      ctx.emit('cancel');
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ModalService[props.modalName].show = (data: any) => {
      ModalService[props.modalName].onShow(data);
      ctx.emit('show', data);
      show.value = true;
    };

    async function cancel(event?: Event) {
      ctx.emit('cancel', event);
      show.value = false;
    }

    async function done(event?: Event) {
      if (props.onDone) {
        if (await props.onDone(event)) {
          show.value = false;
        }
      } else {
        show.value = false;
      }
    }

    return () => (
      <>
        {show.value ? (
          <div
            data-modal
            class={`bcmsModal fixed flex items-center justify-center top-0 left-0 w-full h-full z-1000000 ${
              props.class ? props.class : ''
            }`}
            onClick={(event) => {
              const el = event.target as HTMLElement;
              const result = el.getAttribute('data-modal');
              if (result) {
                cancel();
              }
            }}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M15.536 8.464a1 1 0 010 1.415l-5.657 5.657a1 1 0 01-1.415-1.415l5.657-5.657a1 1 0 011.415 0z"
                      clip-rule="evenodd"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M8.464 8.464a1 1 0 011.415 0l5.657 5.657a1 1 0 11-1.415 1.415L8.464 9.879a1 1 0 010-1.415z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </header>
              <div
                data-bcms-info="modal_body"
                class={`bcmsModal--body px-7.5 bcmsScrollbar xs:px-10 flex flex-col`}
              >
                {ctx.slots.default ? ctx.slots.default() : ''}
              </div>
              {props.noHeader ? (
                ''
              ) : (
                <div class="bcmsModal--actions flex flex-row-reverse items-center pb-7.5 px-7.5 pt-10 rounded-b-2.5 xs:pb-10 xs:px-10">
                  {ctx.slots.actions ? (
                    ctx.slots.actions()
                  ) : (
                    <>
                      <BCMSButton onClick={done}>
                        <span>{props.doneText ? props.doneText : 'Done'}</span>
                      </BCMSButton>
                      <BCMSButton kind="ghost" onClick={cancel}>
                        Close
                      </BCMSButton>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          ''
        )}
      </>
    );
  },
});
