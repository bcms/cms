<img src="https://raw.githubusercontent.com/bcms/cms/v3/assets/readme/bcms-preview.webp" alt="Interface Animation"  width="800px" />  

# BCMS - Open-source Headless CMS

This repository holds open-source version of BCMS, a modern headless CMS that allows you to easily manage content with a flexible structure. User-friendly interface, fast deployment options - makes it perfect for developers and teams looking for a customizable CMS solution.

## Table of Contents

- [Run Locally](#run-locally)
- [Deploy on Debian-based Server with CLI](#deploy-on-debian-based-server-with-cli)
- [Deploy on Debian-based Server Manually](#deploy-on-debian-based-server-manually)
- [Contributing](#contributing)
- [Cloud vs Open-source](#bcms-cloud-vs-open-source-bcms)
- [Support](#support)

## Prerequisites

- Node.js 20
- Docker and Docker Compose
- Git

## Run Locally

1. Make sure that you have Node.js 20, Docker, and Docker Compose installed on your system.
2. Clone the repository: `git clone https://github.com/bcms/cms`
3. Open the repository in your favorite code editor and install dependencies: `npm i`
4. Start the local development server: `docker compose up`
5. When everything is ready, open a browser and navigate to `http://localhost:8080`

## Deploy on Debian-based Server with CLI

After you have a Debian-based server, you can SSH into it and follow the steps below.

### Install Dependencies

Install dependencies if you do not already have them on the server:

```bash
sudo apt update && sudo apt install docker.io git nodejs npm
```

### Update Node.js to version 20:

```bash
npm i -g n && n 20
```

### Set Up GitHub Packages

Since we are using GitHub Packages, you will need to add configuration to the `~/.npmrc` to pull packages. Add the following two lines:

```npm
//npm.pkg.github.com/:_authToken=<GITHUB_TOKEN>
@bcms:registry=https://npm.pkg.github.com
```

To generate a `GITHUB_TOKEN`, follow [this tutorial](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic). The only permission needed for this token is `read:packages`.

### Install BCMS CLI

```bash
npm i -g @bcms/selfhosted-cli
```

### Deploy BCMS

```bash
selfbcms --deploy debian
```

## Deploy on Debian-based Server Manually

After you have a Debian-based server, you can SSH into it and follow the steps below.

### Install Dependencies

```bash
sudo apt update && sudo apt install docker.io git
```

### Create a Directory for BCMS Data

```bash
mkdir ~/bcms
```

### Create Directories for BCMS Container Volumes

```bash
mkdir ~/bcms/db ~/bcms/uploads ~/bcms/backups
```

### Clone the Repository

```bash
git clone https://github.com/bcms/cms
```

### Build Docker Image

```bash
docker build . -t my-bcms
```

### Create Docker Network

```bash
docker network create -d bridge --subnet 10.20.0.0/16 --ip-range 10.20.30.0/24 --gateway 10.20.30.1 bcms-net
```

### Optional: Set Up MongoDB Database in Docker

If you don't have MongoDB, you can run it inside a Docker container on the same server:

```bash
docker run -d --name my-bcms-db -v ~/bcms/db:/data/db -e MONGO_INITDB_ROOT_USERNAME=<DB_ADMIN_USERNAME> -e MONGO_INITDB_ROOT_PASSWORD=<DB_ADMIN_PASSWORD> --network bcms-net mongo:7
```

With this setup, the MongoDB database will be stored in `~/bcms/db` and accessible from `bcms-net` on port 27017.

### Create BCMS Container

```bash
docker run -d --name my-bcms -v ~/bcms/uploads:/app/backend/uploads -v ~/bcms/backups:/app/backend/backups -e "DB_URL=<MONGODB_CONNECTION_URL>" --network bcms-net my-bcms
```

If MongoDB is set up on the same server, the `DB_URL` will be `mongodb://<DB_ADMIN_USERNAME>:<DB_ADMIN_PASSWORD>@my-bcms-db:27017/admin`.

### Set Up Nginx Reverse Proxy

To handle incoming requests, you need to set up an Nginx reverse proxy.

#### Nginx Configuration:

```nginx
# File location: ~/bcms/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
  worker_connections 768;
}

http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  server_tokens off;

  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; 
  ssl_prefer_server_ciphers on;

  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;

  include /etc/nginx/conf.d/*.conf;
  include /etc/nginx/sites-enabled/*;

  add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' blob: data:";
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header Referrer-Policy "no-referrer";

  server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 105G;

    location /api/v4/socket {
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";

      proxy_pass http://my-bcms:8080/api/v4/socket;
    }
    location /__plugin {
      proxy_read_timeout 60;
      proxy_connect_timeout 60;
      proxy_send_timeout 60;
      proxy_pass http://my-bcms:8080/__plugin;
    }
    location / {
      proxy_read_timeout 60;
      proxy_connect_timeout 60;
      proxy_send_timeout 60;
      proxy_pass http://my-bcms:8080;
    }
  }
}
```

This configuration uses the default Nginx virtual host. To use a custom domain, adjust the configuration as needed.

### Create Dockerfile for Nginx

```Dockerfile
# File location: ~/bcms/proxy.Dockerfile
FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
```

### Build Nginx Docker Image

```bash
docker build . -f proxy.Dockerfile -t my-bcms-proxy
```

### Run Nginx Container

```bash
docker run -d -p 80:80 --name my-bcms-proxy --network bcms-net my-bcms-proxy
```

## Contributing

We welcome contributions!

## BCMS Cloud vs. Open-source BCMS
In September 2024, we made a big shift: BCMS Cloud went closed-source (as [BCMS Pro](https://thebcms.com)), and the open-source version became completely standalone.

Why did we do this?

When we first built BCMS, we centralized the authentication system in BCMS Cloud. Even if you were self-hosting, you still had to log in through our system. We thought this would simplify things like inviting users, sending emails, and managing onboarding. But then people on Reddit tore us apart for it. And they were right. So, we listened.

Another issue was keeping BCMS up to date. We’re constantly improving it, but making sure your self-hosted version could update easily was always a technical headache.

The way we originally set up BCMS Cloud also created problems. Each instance had to run on its own isolated VPS, which slowed things down and made infrastructure costs shoot through the roof.

Our goal has always been to create a fast, opinionated content editing experience. But trying to keep both the open-source and Cloud versions moving forward started to feel unsustainable. So, we made the call to split them. The open-source community now has exactly what they asked for: a fully self-contained, self-hostable BCMS, completely free.

Meanwhile, we’ll keep pushing forward on all new - BCMS Pro, now closed-source, redeveloped from ground-up, and optimized for those who need the premium, managed experience.

The core BCMS team is super small - just three engineers, one designer, a project manager, and a content writer. So, we’re focusing most of our energy on [BCMS Pro](https://thebcms.com), but we’re excited to see where the community takes the open-source version.

Happy coding!

## Support

If you have any questions or need help, feel free to open an issue or reach out to us @ [Discord](https://discord.gg/Rr4kTKpU).

## Stay in touch 🌐
<a href="https://twitter.com/thebcms">Follow on X (Twitter)</a><br>
<a href="https://www.linkedin.com/company/thebcms/">Follow on LinkedIn</a><br>
<a href="https://discord.gg/Rr4kTKpU">Join us on Discord</a><br>
