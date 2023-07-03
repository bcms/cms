# BCMS

[![NPM Version][npm-image-ui]][npm-url-ui]
[![NPM Version][npm-image-sdk]][npm-url-sdk]
[![NPM Version][npm-image-backend]][npm-url-backend]
[![NPM Version][npm-image-client]][npm-url-client]
[![NPM Version][npm-image-cli]][npm-url-cli]
[![NPM Version][npm-image-most]][npm-url-most]

[npm-image-client]: https://img.shields.io/npm/v/@becomes/cms-client.svg?label=@becomes/cms-client
[npm-url-client]: https://npmjs.org/package/@becomes/cms-client
[npm-image-ui]: https://img.shields.io/npm/v/@becomes/cms-ui.svg?label=@becomes/cms-ui
[npm-url-ui]: https://npmjs.org/package/@becomes/cms-ui
[npm-image-sdk]: https://img.shields.io/npm/v/@becomes/cms-sdk.svg?label=@becomes/cms-sdk
[npm-url-sdk]: https://npmjs.org/package/@becomes/cms-sdk
[npm-image-backend]: https://img.shields.io/npm/v/@becomes/cms-backend.svg?label=@becomes/cms-backend
[npm-url-backend]: https://npmjs.org/package/@becomes/cms-backend
[npm-image-cli]: https://img.shields.io/npm/v/@becomes/cms-cli.svg?label=@becomes/cms-cli
[npm-url-cli]: https://npmjs.org/package/@becomes/cms-cli
[npm-image-most]: https://img.shields.io/npm/v/@becomes/cms-most.svg?label=@becomes/cms-most
[npm-url-most]: https://npmjs.org/package/@becomes/cms-most

[BCMS](https://thebcms.com) is a Headless CMS (Content Management System). It provides an intuitive content editor and a powerful API. The BCMS platform consists of 2 major parts: [BCMS Cloud](https://cloud.thebcms.com) and BCMS Instance. The BCMS Cloud is a platform that provides a way to create and manage BCMS instances. It is used for issuing BCMS Licenses, managing BCMS Instances, and providing tools for organizations to manage teams and permissions efficiently. BCMS is open-source and offers both free and paid plans.

<div style="margin-bottom: 20px; margin-top: 20px;">
  <a href="https://thebcms.com/pricing" style="padding: 5px 20px; font-size: 20px; background-color: #eee; border-radius: 5px;">See pricing and plans</a>
</div>

## Getting started

### Pre-requirements

- Make sure that [Node 16+](https://nodejs.org/en/) is installed on your system.
- Make sure that [Docker](https://www.docker.com/) is installed and running on your system.
- If you do not have it installed, install the [Docker Compose](https://docs.docker.com/compose/) tool first.

### Installation

- Install BCMS CLI: `npm i -g @becomes/cms-cli@latest`
- Open a terminal and navigate to a place where you would like to create a project.
- Create a project by running: `bcms --cms create`.
- Navigate into the project directory and execute the command `docker-compose up`.
- BCMS will be available on port 8080: http://localhost:8080
- Done.

## Connection

![Cloud connection](/assets/readme/bcms-connection.png)

_Figure 1 - Connection between the BCMS Cloud and BCMS Instance._

1. User connection to `https://<instance_name>.yourbcms.com` domain name.
2. CloudFlare sends a proxy request to Nginx controlled by [BCMS Shim](https://github.com/bcms/shim)
3. Nginx sends a proxy request to [BCMS Backend]('backend')
4. The BCMS Cloud sends requests to the BCMS Shim on port 3000, utilizing a secure connection.
5. The BCMS Cloud sends a proxy request to the BCMS Shim.
6. The BCMS Shim sends requests to the BCMS Cloud via a secure channel.
7. Internal communication takes place between the BCMS Shim and the Backend.
8. A connection is established between the BCMS Backend and the Database.

## [Documentation](https://docs.thebcms.com)
