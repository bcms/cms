import { createBcmsFunction } from '@bcms/function';

export default createBcmsFunction(() => {
  return {
    config: {
      name: 'test',
      public: true,
    },
    async handler({ request }) {
      return { ...request.body, test: true };
    },
  };
});
