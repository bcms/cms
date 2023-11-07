import { PropType, defineComponent } from 'vue';
import { Link } from './link';
import { ChevronDown } from './icons';

export interface NavItem {
  name?: string;
  href?: string;
  method?: string;
  children?: NavItem[];
  showChildren?: boolean;
  active?: boolean;
}

export const Nav = defineComponent({
  props: {
    items: { type: Array as PropType<NavItem[]>, required: true },
    root: Boolean,
  },
  emits: {
    click: (_item: NavItem) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div>
        {props.items.map((item) => {
          if (item.children) {
            return (
              <div class={`text-left ${props.root ? 'mb-4' : ''}`}>
                <button
                  class="flex text-left"
                  onClick={() => {
                    item.showChildren = !item.showChildren;
                  }}
                >
                  <div
                    class={`flex ${
                      item.showChildren ? 'rotate-180 items-end' : 'items-start'
                    }`}
                  >
                    <ChevronDown class="w-4 h-4" />
                  </div>
                  {item.method && <div>{item.method}</div>}
                  {item.name && <div>{item.name}</div>}
                </button>
                {item.showChildren && (
                  <div class="ml-4">
                    <Nav items={item.children} />
                  </div>
                )}
              </div>
            );
          }
          return (
            <div class="ml-4">
              <Link
                href={item.href as string}
                onClick={() => {
                  ctx.emit('click', item);
                }}
              >
                {item.method && <div>{item.method}</div>}
                {item.name && <div>{item.name}</div>}
              </Link>
            </div>
          );
        })}
      </div>
    );
  },
});
