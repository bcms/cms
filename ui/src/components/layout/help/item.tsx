import { defineComponent, type PropType } from 'vue';
import { BCMSIcon } from '../..';
import { DefaultComponentProps } from '../../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    tag: {
      type: String as PropType<'button' | 'a' | 'div'>,
      default: 'button',
    },
    icon: {
      type: String,
      default: '',
    },
    title: {
      type: [String, Function],
      default: '',
    },
    level: {
      type: Number,
      default: 1,
    },
    action: {
      type: String || undefined,
      default: undefined,
    },
    url: {
      type: String || undefined,
    },
    isMac: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => {
      const Tag = props.url ? 'a' : props.tag;

      function toggleDarkMode() {
        if (document.documentElement.classList.contains('dark')) {
          window.bcms.sdk.storage.set('theme', 'light');
        } else {
          window.bcms.sdk.storage.set('theme', 'dark');
        }

        document.documentElement.classList.toggle('dark');
      }

      const handleClick = () => {
        switch (props.action) {
          case 'dark-mode':
            toggleDarkMode();
            break;
          case 'global-search':
            window.bcms.globalSearch.show();
            break;
          default:
            break;
        }
      };
      return (
        <li class="list-none select-none">
          <Tag
            href={props.url}
            target={Tag === 'a' ? '_blank' : undefined}
            class={`group text-dark dark:text-light py-1.5 px-3.5 w-full text-left no-underline items-center
              ${props.level === 1 ? 'flex items-center gap-2' : ''}
              ${props.level === 2 ? 'flex items-center gap-2' : ''}
              ${
                props.level === 3
                  ? 'text-opacity-50 font-normal text-sm block dark:font-thin'
                  : ''
              }
              ${
                props.level === 4
                  ? 'text-opacity-50 font-normal mt-1.5 py-0 text-xs inline-block dark:text-opacity-30'
                  : ''
              }
              ${
                ['a', 'button'].includes(Tag)
                  ? 'transition-colors duration-300 hover:text-green focus:text-green hover:bg-light focus:bg-light dark:hover:bg-dark dark:focus:bg-dark dark:hover:text-light dark:focus:text-light'
                  : ''
              }
              ${props.class}
          `}
            onClick={() => {
              handleClick();
              ctx.emit('click');
            }}
          >
            {ctx.slots.default ? (
              ctx.slots.default()
            ) : (
              <>
                {props.icon && (
                  <BCMSIcon
                    src={`/${props.icon}`}
                    class="text-dark dark:text-light text-opacity-80 fill-current w-4 h-4 mr-1.5 mb-0.5 transition-colors duration-300 group-hover:text-green group-focus:text-green dark:group-hover:text-yellow dark:group-focus:text-yellow"
                  />
                )}
                <span>
                  {typeof props.title === 'function'
                    ? props.title(window.bcms.sdk.storage.get('theme'))
                    : props.title}
                </span>
                {props.action === 'global-search' ? (
                  <span class="ml-auto text-xs text-grey">
                    {props.isMac ? 'CMD' : 'CTRL'} + K
                  </span>
                ) : (
                  ''
                )}
              </>
            )}
          </Tag>
        </li>
      );
    };
  },
});
export default component;
