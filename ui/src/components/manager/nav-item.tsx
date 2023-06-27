import { defineComponent, type PropType, reactive } from 'vue';
import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';
import { DefaultComponentProps } from '../_default';
import BCMSLink from '../link';
import BCMSIcon from '../icon';
import type { BCMSManagerNavItemType } from '../../types';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    item: { type: Object as PropType<BCMSManagerNavItemType>, required: true },
  },
  emits: {
    open: (_event: Event, _item: BCMSManagerNavItemType) => {
      return true;
    },
  },
  setup(props, ctx) {
    props = reactive(props);

    return () => (
      <li
        class={`relative ${
          props.item.selected
            ? 'desktop:before:absolute desktop:before:w-[5px] desktop:before:h-[5px] desktop:before:rounded-full desktop:before:bg-green desktop:before:top-1/2 desktop:before:left-[-15px] desktop:before:-translate-y-1/2 desktop:dark:before:bg-yellow'
            : ''
        }`}
      >
        <BCMSLink
          href={props.item.link}
          clickOverride={true}
          onClick={(event) => {
            event.preventDefault();
            if (props.item.onClick) {
              props.item.onClick(event, props.item);
            } else {
              ctx.emit('open', event, props.item);
            }
          }}
          class={`group flex items-center justify-between no-underline py-1 px-4 transition-all duration-300 rounded-3.5 border border-dark ${
            props.item.selected
              ? 'bg-green border-green text-white font-semibold desktop:bg-transparent'
              : 'text-dark'
          } desktop:text-dark desktop:py-2.5 desktop:px-0 desktop:mb-1.5 desktop:rounded-none desktop:border-none`}
        >
          <span class="text-base leading-tight -tracking-0.01 relative desktop:after:block desktop:after:w-full desktop:after:h-px desktop:after:absolute desktop:after:top-full desktop:after:left-0 desktop:after:bg-dark desktop:after:bg-opacity-0 desktop:after:transition-all desktop:after:duration-500 desktop:after:rounded-sm desktop:after:-translate-y-0.5 desktop:group-hover:after:translate-y-0 desktop:group-focus-visible:after:translate-y-0 desktop:group-hover:after:bg-opacity-100 desktop:group-focus-visible:after:bg-opacity-100 dark:text-light dark:desktop:after:bg-yellow dark:desktop:after:bg-opacity-0">
            {props.item.name}
          </span>
          {props.item.role && props.item.role === BCMSJwtRoleName.ADMIN ? (
            <span class="flex items-center text-dark">
              <BCMSIcon
                src="/administration/admin-role"
                class="fill-current transition-all duration-300 w-5 h-5 group-hover:text-green group-focus-visible:text-green desktop:w-6 desktop:h-6"
              />
            </span>
          ) : (
            ''
          )}
        </BCMSLink>
      </li>
    );
  },
});
export default component;
