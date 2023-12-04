import { Preview } from '@storybook/vue3';
// Tailwind config
import '../src/stories/_main.scss';
import '../src/stories/main';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
