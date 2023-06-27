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

[BCMS](https://thebcms.com) is a Headless CMS (Content Management System). It provides a powerful API, best-in-class model builder, and intuitive content editor. BCMS platform consists of 2 major parts: [BCMS Cloud](https://cloud.thebcms.com) and BCMS Instance. The BCMS Cloud is a platform that provides a way to create and manage BCMS instances. It is used for issuing BCMS Licenses, managing BCMS Instances, and providing tools for organizations to manage teams and permissions efficiently. The BCMS is an Open-Source and has both free and paid plans.

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
- CD into the project and run `docker-compose up`.
- BCMS will be available on post 8080: http://localhost:8080
- Done.

## Connection

![Cloud connection](/assets/readme/bcms-connection.png)

_Figure 1 - Connection between the BCMS Cloud and BCMS Instance._

1. User connection to `https://<instance_name>.yourbcms.com` domain name.
2. CloudFlare proxy request to Nginx controlled by [BCMS Shim](https://github.com/bcms/shim)
3. Nginx proxy request to [BCMS Backend]('backend')
4. BCMS Cloud request to BCMS Shim on port 3000 with secure connection.
5. BCMS Cloud to BCMS Shim proxy request.
6. BCMS Shim to BCMS Cloud request via secure channel.
7. Internal communication between BCMS Shim and Backend.
8. Connection between BCMS Backend and Database.

## [Documentation](https://docs.thebcms.com)
