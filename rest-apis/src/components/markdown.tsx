import { DefaultComponentProps } from '@ui/components/_default';
import { Remarkable } from 'remarkable';
import { computed, defineComponent } from 'vue';

export const Markdown = defineComponent({
  props: {
    ...DefaultComponentProps,
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const md = new Remarkable({
      html: true,
    });
    const markdown = computed(() => md.render(props.text));

    return () => (
      <div
        id={props.id}
        class={props.class}
        style={props.style}
        v-html={markdown.value}
      />
    );
  },
});
