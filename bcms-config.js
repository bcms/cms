module.exports = {
  frontend: {
    useCustom: true,
    custom: {
      props: ['entryStore'],
    },
  },
  server: {
    port: 1280,
    security: {
      jwt: {
        secret: 'jwt-256-bit-secret',
        issuer: 'localhost',
      },
    },
    database: {
      type: 'MONGO_SELF_HOSTED',
      mongo: {
        database: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          name: process.env.DB_NAME,
          user: process.env.DB_USER,
          pass: process.env.DB_PASS,
          prefix: process.env.DB_PRFX,
          cluster: '',
        },
      },
    },
    git: {
      install: false,
      use: false,
      email: 'user-email',
      username: 'username',
      password: '@GIT_PASSWORD',
      host: 'git-host',
      repo: 'git-repo',
      repo_owner: 'git-repo-owner',
      branch: 'git-repo-branch',
    },
    env: {},
  },
};
