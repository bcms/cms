import { setup, Preview } from '@storybook/vue3';
import { clickOutside, cy, tooltip } from '../src/directives';
// Tailwind config
import '../src/stories/_main.scss';
import '../src/stories/main';

setup((app) => {
  app.directive('clickOutside', clickOutside);
  app.directive('cy', cy);
  app.directive('tooltip', tooltip);
});

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
