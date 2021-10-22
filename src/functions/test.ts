import * as sha1 from 'crypto-js/sha1';
import { createBcmsFunction } from '@becomes/cms-backend/function';

export default createBcmsFunction(async () => {
  return {
    config: {
      name: 'test',
      public: true,
    },
    async handler({ request }) {
      return { ...request.body, test: true, id: sha1(Date.now() + '') };
    },
  };
});
