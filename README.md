# BCMS - Open-source Headless CMS

BCMS is an open-source, self-hostable Headless CMS. Built with Node.js, MongoDB, Vue 3, and Tailwind.

Design your content structure without leaving the browser.

Table of contents:

-   [Run locally](#run-locally)
-   [Deploy on Debian based server with CLI](#deploy-on-debian-based-server-with-cli)
-   [Deploy on Debian based server manually](#deploy-on-debian-based-server-manually)

## Run locally

-   Make sure that you have Node.js 20, Docker and Docker Compose installed on your system
-   Clone the repository: `git clone https://github.com/bcms/cms`
-   Open the repository in your favorite code editor and install dependencies: `npm i`
-   Start local development server: `docker compose up`
-   When everything is ready, you can open a browser and navigate to http://localhost:8080

## Deploy on Debian based server with CLI

After you have a Debian based server, you can SSH into it and follow the steps
bellow.

Install dependencies if you do not already have them on the server:

```bash
sudo apt update && sudo apt install docker.io git nodejs npm
```

Update node to version 20:

```bash
npm i -g n && n 20
```

Install BCMS CLI:

```bash
npm i -g @bcms/selfhosted-cli
```

## Deploy on Debian based server manually

After you have a Debian based server, you can SSH into it and follow the steps
bellow.

Install dependencies if you do not already have them on the server:

```bash
sudo apt update && sudo apt install docker.io git
```

Create a directory in which you'll store BCMS data, we'll use home directory:

```bash
mkdir ~/bcms
```

Create directories which will be used for BCMS container volumes:

```bash
mkdir ~/bcms/db ~/bcms/uploads ~/bcms/backups
```

Clone the repository:

```bash
git clone https://github.com/bcms/cms
```

Enter the repository and build a Docker image:

```bash
docker build . -t my-bcms
```

Create a docker network for Docker:

```bash
docker network create -d bridge --subnet 10.20.0.0/16 --ip-range 10.20.30.0/24 --gateway 10.20.30.1 bcms-net
```

Optional: If you don't have MongoDB database you can run it inside of Docker
container on the same server:

```bash
docker run -d --name my-bcms-db -v ~/bcms/db:/data/db -e MONGO_INITDB_ROOT_USERNAME=<DB_ADMIN_USERNAME> -e MONGO_INITDB_ROOT_PASSWORD=<DB_ADMIN_PASSWORD> --network bcms-net mongo:7
```

With this done, MongoDB database will be stored in `~/bcms/db` and can only be
accessible from `bcms-net` on port 27017.

Create BCMS container:

```bash
docker run -d --name my-bcms -v ~/bcms/uploads:/app/backend/uploads -v ~/bcms/backups:/app/backend/backups -e "DB_URL=<MONGODB_CONNECTION_URL>" --network bcms-net my-bcms
```

If you followed the optional step to setup a MongoDB on the same server, _DB_URL_ will be `mongodb://<DB_ADMIN_USERNAME>:<DB_ADMIN_PASSWORD>@my-bcms-db:27017/admin`

Last thing is to setup and Nginx reverse proxy for connections to the server.
For this we will create a Docker container which will expose port 80 to the web
and proxy requests to the BCMS at port 8080 inside of Docker network:

```nginx configuration
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

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
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

Have in mind that this config is using default Nginx virtual host. If you
would like to use custom domain name (instead of IP address) change the config
to suite your needs.

Create a Dockerfile for building Nginx container:

```Dockerfile
# File locatioin: ~/bcms/proxy.Dockerfile
FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf
```

Create an Nginx Docker image:

```bash
docker build . -f proxy.Dockerfile -t my-bcms-proxy
```

Run the Nginx container:

```bash
docker run -d -p 80:80 --name my-bcms-proxy --network bcms-net my-bcms-proxy
```

That's it, BCMS should now be available via Nginx proxy. We recommend to setup
CloudFlare or some other CDN in front of the server so that you do not expose
server IP and this will also allow you to easily configure full SSL connection
between a client and an origin server.
