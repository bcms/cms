import { defineComponent, type PropType, reactive } from 'vue';

const component = defineComponent({
  props: {
    kind: {
      type: String as PropType<
        'primary' | 'secondary' | 'alternate' | 'ghost' | 'danger'
      >,
      default: 'primary',
    },
    cyTag: String,
    class: String,
    style: String,
    disabled: Boolean,
    size: String as PropType<'m' | 's'>,
    href: String,
    newTab: Boolean,
  },
  emits: {
    click: (_: MouseEvent) => {
      return true;
    },
  },
  setup(props, ctx) {
    props = reactive(props);

    const Tag = props.href ? 'a' : 'button';

    return () => {
      return (
        <Tag
          class={`bcmsButton bcmsButton_${
            props.kind
          } rounded-3.5 transition-all duration-300 inline-block font-medium text-base leading-normal -tracking-0.01 whitespace-normal no-underline border border-solid select-none disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none ${
            props.kind === 'primary'
              ? 'bg-dark border-dark text-white hover:shadow-btnPrimary hover:text-white focus:shadow-btnPrimary focus:text-white active:shadow-btnPrimary active:text-white disabled:bg-grey disabled:opacity-50 disabled:border-grey disabled:border-opacity-50 dark:bg-pink dark:border-pink dark:hover:shadow-btnPrimaryDark dark:focus-visible:shadow-btnPrimaryDark'
              : props.kind === 'secondary'
              ? 'bg-white border-pink text-pink hover:shadow-btnSecondary hover:text-pink focus:shadow-btnSecondary focus:text-pink active:shadow-btnSecondary active:text-pink disabled:border-pink disabled:border-opacity-50'
              : props.kind === 'alternate'
              ? 'bg-light border-light text-dark text-opacity-80 hover:shadow-btnAlternate hover:text-dark hover:text-opacity-100 focus:shadow-btnAlternate focus:text-dark focus:text-opacity-100 active:shadow-btnAlternate active:text-dark active:text-opacity-100 disabled:opacity-50'
              : props.kind === 'ghost'
              ? 'bg-transparent border-none text-grey hover:shadow-btnGhost hover:text-dark hover:text-opacity-80 focus:shadow-btnGhost focus:text-dark focus:text-opacity-80 active:shadow-btnGhost active:text-dark active:text-opacity-80 disabled:opacity-50 dark:hover:text-light dark:hover:text-opacity-100 dark:focus:text-light dark:focus-visible:text-opacity-100'
              : props.kind === 'danger'
              ? 'bg-red border-red text-white hover:shadow-btnDanger hover:text-white focus:shadow-btnDanger focus:text-white active:shadow-btnDanger active:text-white disabled:bg-red disabled:bg-opacity-50 disabled:border-red disabled:border-opacity-20'
              : ''
          } ${
            props.size
              ? props.size === 's'
                ? 'py-[3px] px-[7px]'
                : props.size === 'm'
                ? 'py-1.5 px-3.5'
                : ''
              : 'py-1.5 px-5'
          } ${props.class ? props.class : ''}`}
          v-cy={props.cyTag}
          style={props.style}
          disabled={props.disabled}
          onClick={(event) => {
            ctx.emit('click', event);
          }}
          href={props.href ? props.href : undefined}
          target={props.newTab ? '_blank' : undefined}
        >
          {ctx.slots.default ? (
            <span
              class={`relative z-10 ${
                props.disabled
                  ? props.kind === 'primary'
                    ? 'text-white text-opacity-50'
                    : props.kind === 'secondary'
                    ? 'text-pink text-opacity-50'
                    : props.kind === 'alternate'
                    ? 'opacity-100 text-dark text-opacity-80'
                    : props.kind === 'ghost'
                    ? 'opacity-100 text-dark text-opacity-80'
                    : props.kind === 'danger'
                    ? 'text-white text-opacity-50'
                    : ''
                  : ''
              }`}
            >
              {ctx.slots.default()}
            </span>
          ) : (
            ''
          )}
        </Tag>
      );
    };
  },
});
export default component;
