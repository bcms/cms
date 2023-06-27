import { computed, defineComponent } from 'vue';
import { DefaultComponentProps } from '../_default';
import type { BCMSArrayPropMoveEventData } from '../../types';
import BCMSIcon from '../icon';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    arrayLength: {
      type: Number,
      default: 0,
    },
    immovable: Boolean,
    itemPositionInArray: {
      type: Number,
      required: true,
    },
  },
  emits: {
    move: (_data: BCMSArrayPropMoveEventData) => {
      return true;
    },
    remove: (_itemPosition: number) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });

    return () => (
      <div
        class={`rounded-2.5 border border-solid border-pink pt-9 px-2.5 pb-6 relative border-t-0 rounded-t-none mb-10 sm:px-5 ${
          props.itemPositionInArray === 0 ? 'mb-10' : 'last:mb-10'
        } ${props.class}`}
      >
        <div class="w-[calc(100%+2px)] absolute -top-2.5 -left-px flex items-center justify-between">
          <div class="flex items-center pb-1.5 relative w-full justify-between before:w-2.5 before:h-2.5 before:absolute before:top-0 before:left-0 before:rounded-tl-2.5 before:border-l before:border-t before:border-pink after:w-2.5 after:h-2.5 after:absolute after:top-0 after:right-0 after:rounded-tr-2.5 after:border-t after:border-r after:border-pink">
            <div class="flex items-center relative w-full pl-4 pr-3.5 translate-x-0 translate-y-[-7px] text-pink after:relative after:top-1/2 after:flex-grow after:h-px after:translate-x-1 after:-translate-y-0.5 after:bg-pink">
              <div class="text-xs leading-normal tracking-0.06 uppercase text-pink flex-grow-0 mr-1 flex-shrink-0">
                {translations.value.prop.wrapperArrayItem.itemIndex({
                  index: props.itemPositionInArray + 1,
                })}
              </div>
            </div>
            <div class="flex items-center flex-nowrap flex-shrink-0 pr-4 -mt-4">
              {!props.immovable ? (
                <>
                  {props.itemPositionInArray > 0 ? (
                    <button
                      class="p-1.25"
                      onClick={() => {
                        ctx.emit('move', {
                          direction: -1,
                          currentItemPosition: props.itemPositionInArray,
                        });
                      }}
                    >
                      <BCMSIcon
                        src="/arrow/up"
                        class="w-6 h-6 block text-pink fill-current"
                      />
                    </button>
                  ) : (
                    ''
                  )}
                  {props.itemPositionInArray < props.arrayLength - 1 ? (
                    <button
                      class="p-1.25"
                      onClick={() => {
                        ctx.emit('move', {
                          direction: 1,
                          currentItemPosition: props.itemPositionInArray,
                        });
                      }}
                    >
                      <BCMSIcon
                        src="/arrow/down"
                        class="w-6 h-6 block text-pink fill-current"
                      />
                    </button>
                  ) : (
                    ''
                  )}
                </>
              ) : (
                ''
              )}
              <button
                class="p-1.25"
                onClick={() => {
                  ctx.emit('remove', props.itemPositionInArray);
                }}
              >
                <BCMSIcon
                  src="/trash"
                  class="w-6 h-6 block text-pink fill-current"
                />
              </button>
            </div>
          </div>
        </div>
        <div class="justify-between flex-wrap gap-2.5 -mt-2.5">
          {ctx.slots.default ? ctx.slots.default() : ''}
        </div>
      </div>
    );
  },
});
export default component;
