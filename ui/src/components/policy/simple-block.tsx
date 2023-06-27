import type { BCMSUser } from '@becomes/cms-sdk/types';
import { defineComponent, type PropType } from 'vue';
import Icon from '../icon';
import { DefaultComponentProps } from '../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    text: {
      type: String,
      required: true,
    },
    selected: Boolean,
    users: {
      type: Array as PropType<BCMSUser[]>,
      required: true,
    },
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div class="relative">
        <button
          id={props.id}
          v-cy={props.cyTag}
          class={`flex items-center bg-light space-x-4 shadow-btnAlternate rounded-3xl px-4 py-3 ${
            props.selected ? '' : ''
          } ${props.class} dark:bg-darkGrey dark:bg-opacity-50`}
          onClick={() => {
            ctx.emit('click');
          }}
        >
          <span
            class={`relative flex-shrink-0 ${
              props.selected
                ? 'bg-pink border-pink dark:bg-yellow dark:border-yellow'
                : 'bg-white border-grey'
            } border rounded w-5 h-5 flex justify-center items-center`}
          >
            {props.selected && (
              <Icon
                src="/checkmark"
                class="w-3.5 text-white fill-current relative -top-px dark:text-dark"
              />
            )}
          </span>
          <div class="leading-tight -tracking-0.01 text-left dark:text-light">
            {props.text}
          </div>
        </button>
        {props.users.length > 0 && (
          <div class="absolute bottom-0 right-0 translate-y-1/2 flex items-center  -space-x-1.5">
            {props.users.map((user, userIndex) => {
              return (
                <div
                  v-tooltip={user.username}
                  class="flex select-none"
                  style={{ zIndex: props.users.length - userIndex }}
                >
                  {user.customPool.personal.avatarUri ? (
                    <img
                      src={user.customPool.personal.avatarUri}
                      alt={user.username}
                      class="w-5 h-5 object-cover rounded-full"
                    />
                  ) : (
                    <div class="w-5 h-5 rounded-full bg-grey outline-green flex justify-center items-center dark:outline-yellow">
                      <span class="text-white font-semibold relative top-0.5 text-[11px]">
                        {user.username
                          .split(' ')
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});
export default component;
