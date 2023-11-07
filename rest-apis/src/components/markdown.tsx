import { Remarkable } from 'remarkable';
import { computed, defineComponent } from 'vue';

export const Markdown = defineComponent({
  props: {
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

    return () => <div v-html={markdown.value} />;
  },
});
