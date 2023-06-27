import { defineComponent, ref, computed } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSIcon, BCMSMarkdownDisplay } from '..';

const component = defineComponent({
  props: {
    class: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
  },
  emits: {
    input: (_: string) => {
      return true;
    },
    'update:modelValue': (_?: string) => {
      return true;
    },
  },
  setup(props) {
    const showInstructions = ref(false);

    const translations = computed(() => {
      return useTranslation();
    });

    return () => {
      return (
        <div class={`mb-5 select-none ${props.class || ''}`}>
          <button
            v-cy={'instructions-toggle'}
            class="mt-6 text-xs leading-normal tracking-0.06 uppercase text-dark flex items-start gap-2 desktop:-mt-9 dark:text-light"
            onClick={() => {
              showInstructions.value = !showInstructions.value;
            }}
          >
            <span>
              {props.label || translations.value.page.entry.instructions}
            </span>
            <div
              class={`${
                showInstructions.value ? 'ml-0.5 rotate-90' : '-translate-y-0.5'
              }`}
            >
              <BCMSIcon
                src="/caret/right"
                class="relative w-1 h-3 mt-1 fill-current text-dark dark:text-light"
              />
            </div>
          </button>
          {showInstructions.value && (
            <BCMSMarkdownDisplay
              markdown={props.content}
              class="p-0 mt-2.5 text-grey -tracking-0.03 leading-tight border-none"
            />
          )}
        </div>
      );
    };
  },
});

export default component;
