import { Login, ObjectUtil, sdk } from '../util';

describe('User API', async () => {
  Login();
  it('should get currently logged in User', async () => {
    const result = await sdk.user.get();
    ObjectUtil.eq(
      result,
      {
        _id: '111111111111111111111111',
        email: '',
        roles: [
          {
            name: 'ADMIN',
            permissions: [
              {
                name: 'READ',
              },
              {
                name: 'WRITE',
              },
              {
                name: 'DELETE',
              },
              {
                name: 'EXECUTE',
              },
            ],
          },
        ],
        username: 'Dev User',
        createdAt: 1627401751338,
        updatedAt: 1627401751338,
        customPool: {
          personal: {
            firstName: 'Dev',
            lastName: 'User',
            avatarUri: '',
          },
          address: {},
          policy: {
            media: {
              get: false,
              post: false,
              put: false,
              delete: false,
            },
            templates: [],
            plugins: [],
          },
        },
      },
      'user',
    );
  });
});
