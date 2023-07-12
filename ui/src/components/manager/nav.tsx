import { computed, defineComponent, type PropType, ref } from 'vue';
import { DefaultComponentProps } from '../_default';
import BCMSButton from '../button';
import BCMSIcon from '../icon';
import BCMSManagerNavItem from './nav-item';
import type { BCMSManagerNavItemType } from '../../types';
import { useRouter } from 'vue-router';
import { BCMSSelect } from '../input';
import pluralize from 'pluralize';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: {
      type: String,
      default: '',
    },
    items: {
      type: Array as PropType<BCMSManagerNavItemType[]>,
      default: () => [],
    },
    actionText: String,
  },
  emits: {
    click: (_event: Event, _item: BCMSManagerNavItemType) => {
      return true;
    },
    action: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const extended = ref(true);
    const router = useRouter();
    const items = computed(() => {
      return [...props.items].sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
    });

    return () => (
      <div
        style={props.style}
        id={props.id}
        class={`relative w-screen h-auto z-[999999] desktop:fixed desktop:h-screen desktop:top-0 desktop:left-[250px] desktop:w-[180px] desktop:border-r desktop:border-grey desktop:border-opacity-50 lg:left-[300px] lg:w-[240px] ${
          props.class || ''
        }`}
      >
        <div class="bcmsScrollbar flex justify-between items-end flex-wrap py-7.5 px-5 gap-5 max-w-full overflow-x-visible overflow-y-auto max-h-full desktop:pt-[185px]">
          <div class="flex-1 relative max-w-full desktop:pb-[75px] desktop:px-5">
            {ctx.slots.default ? (
              ctx.slots.default()
            ) : (
              <>
                <button
                  class="text-xs leading-normal tracking-0.06 mb-[25px] uppercase w-[calc(100%+15px)] text-left relative items-center translate-x-[-15px] hidden desktop:flex dark:text-light"
                  onClick={() => {
                    extended.value = !extended.value;
                  }}
                >
                  <span
                    class={`flex mr-3 ${extended.value ? 'rotate-90' : ''}`}
                  >
                    <BCMSIcon
                      src="/caret/right"
                      class="w-1 h-2 text-dark fill-current dark:text-light"
                    />
                  </span>
                  <span class="pointer-events-none">{props.label}</span>
                </button>
                <BCMSSelect
                  class="min-w-[200px] mr-5 max-w-max desktop:hidden"
                  placeholder={`Select ${pluralize.singular(props.label)}`}
                  label={`Select ${pluralize.singular(props.label)}`}
                  options={props.items.map((e) => {
                    return { label: e.name, value: e.link };
                  })}
                  selected={
                    props.items.find((e) => e.selected)
                      ? props.items.find((e) => e.selected)?.link
                      : ''
                  }
                  onChange={(event) => {
                    router.push(event.value);
                  }}
                />
                <ul
                  class={`hidden list-none items-center gap-4 max-w-max pr-10 overflow-visible min-w-[300px] ${
                    extended.value ? 'desktop:block' : 'desktop:hidden'
                  } desktop:min-w-[unset] desktop:pr-0 desktop:max-w-full`}
                >
                  {items.value.map((item) => {
                    return (
                      <BCMSManagerNavItem
                        item={item}
                        onOpen={() => {
                          router.push(item.link);
                        }}
                      />
                    );
                  })}
                </ul>
              </>
            )}
          </div>
          {props.actionText ? (
            <div class="managerLayout--sideNav-footer flex flex-shrink-0 desktop:py-5 desktop:pl-2 desktop:fixed desktop:max-w-[170px] desktop:bottom-0 desktop:left-[250px] lg:max-w-[240px] lg:left-[300px] lg:px-10">
              <BCMSButton
                class="w-auto mt-0 min-w-max desktop:mt-2.5"
                size="m"
                onClick={() => {
                  ctx.emit('action');
                }}
              >
                {props.actionText}
              </BCMSButton>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  },
});

export default component;
