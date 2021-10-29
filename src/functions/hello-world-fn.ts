import { createBcmsFunction } from '@becomes/cms-backend/function';

export default createBcmsFunction(async () => {
  return {
    config: {
      name: 'hello-world-fn',
      public: true,
    },
    async handler({ request }) {
      return { ...request.body, test: true };
    },
  };
});
