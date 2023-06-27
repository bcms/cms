import type { BCMSUser } from '@becomes/cms-sdk/types';
import { defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from './_default';

export const BCMSUserAvatar = defineComponent({
  props: {
    ...DefaultComponentProps,
    user: {
      type: Object as PropType<BCMSUser>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div
        id={props.id}
        style={props.style}
        class={`relative flex ${props.class || ''}`}
      >
        {props.user.customPool.personal.avatarUri ? (
          <img
            src={props.user.customPool.personal.avatarUri}
            alt={props.user.username}
            class="w-10 h-10 rounded-full object-cover mr-2.5"
          />
        ) : (
          <div class="w-10 h-10 rounded-full bg-grey bg-opacity-70 border-2 border-green mr-2.5 flex justify-center items-center select-none dark:border-yellow">
            <span class="text-white font-semibold relative top-0.5">
              {props.user.username
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        )}
      </div>
    );
  },
});
