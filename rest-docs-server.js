const path = require('path');
const {
  createPurpleCheetah,
  createCorsMiddleware,
  createMiddleware,
} = require('@becomes/purple-cheetah');

createPurpleCheetah({
  port: '8000',
  middleware: [
    createCorsMiddleware(),
    createMiddleware({
      name: 'files',
      handler() {
        /**
         * @param {import('express').Request} req
         * @param {import('express').Response} res
         * @param {import('express').NextFunction} next
         */
        return (req, res, _next) => {
          res.sendFile(path.join(process.cwd(), ...req.path.split('/')));
        };
      },
    }),
  ],
});
