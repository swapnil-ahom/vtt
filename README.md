
Back-end API architecture based app for VTT.


## > Table of contents
### Prerequisites

* Git
* Node.js >= 14.16.0
* NPM >= 6.14.0
* A database engine with a dedicated database

When you're with that, starting your project is a matter of minutes. :clock12:

### Step 1: install

```bash
$ git clone https://github.com/konfer-be/typeplate.git path-to/your-project-name/
```

### Step 2: go to

```bash
$ cd path-to/your-project-name/
```

### Step 3: build

```bash
$ npm run kickstart:dev
```

### Step 4: setup package.json

Open the *./package.json* file and edit it with your own values.

### Step 5: setup environment

Open *./dist/env/development.env* and fill the required env variables (uncommented in the file). See [env variables list](https://github.com/konfer-be/typeplate/wiki/Environment-variables) for more informations.

```bash
# Access token Secret passphrase
ACCESS_TOKEN_SECRET = "your-secret"

# CORS authorized domains
AUTHORIZED = "http://localhost:4200,https://localhost:3000,https://vttuat.atwpl.com,https://vttuatapi.atwpl.com"

# API domain
DOMAIN = "localhost"

# Application port.
PORT = 8101

# Refresh token Secret passphrase
REFRESH_TOKEN_SECRET = "your-secret"

# Database engine
TYPEORM_TYPE = "mysql"

# Database server host
TYPEORM_HOST = "localhost"

# Database name. Keep it different from your developement database.
TYPEORM_DB = "your-database"

# Database user
TYPEORM_USER = "root"

# Database password
TYPEORM_PWD = ""

# Database port
TYPEORM_PORT = "3306"
```

### Step 7: run

```bash
$ nodemon
```

## > Entity generation

Some repetitive tasks such as creating resources can be done easily with [rsgen](https://github.com/konfer-be/rsgen).

See [entity generation](https://github.com/konfer-be/typeplate/wiki/Entity-generation) wiki section to learn more about generated elements and how to use.

## > Documentation

```bash
$ npm run doc
```

Generate API documentation website into *./docs/apidoc/*.

See [apidoc](http://apidocjs.com/) for more informations about customization.

## > Tests

```bash
$ npm run test --env test
```
### Deploy

Pm 2 must be installed on the target server and your SSH public key granted.

```bash
# Setup deployment at remote location
$ pm2 deploy production setup

# Update remote version
$ pm2 deploy production update
```

