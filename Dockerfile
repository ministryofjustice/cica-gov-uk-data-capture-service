# lets start from an image that already has nodejs installed
FROM node:22.8.0-bookworm-slim AS base

RUN groupadd -g 1014 dc_user \
    && useradd -rm -d /usr/src/app -u 1015 -g dc_user dc_user
USER dc_user

# Essentially running mkdir <name> inside the current working
# directory, and then cd <name>
WORKDIR /usr/src/app
#no chnage made
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Expose port 3100 inside the container to the outside world
# so that http://localhost:3100 routes the network traffic to
# the container
EXPOSE 3100

# Defult to production. npm will ignore devDependencies in production mode
ARG NODE_ENV=production

FROM base AS production

ENV NODE_ENV=production


# RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Download RDS certificates bundle for SSL verification
ADD --chown=dc_user https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem ./ca/rds-combined-ca-bundle.pem

USER 1015
# the command line to run when the container is started
CMD [ "npm", "start" ]

# Using a different image version dev,
# Issues with nodemon spawning and killing processes on restart
# Change this when changing the production image
# keep both in sync, production -slim variant
# dev the non-slim variant
FROM node:22.8.0-bookworm AS dev

RUN groupadd -g 1014 dc_user \
    && useradd -rm -d /usr/src/app -u 1015 -g dc_user dc_user
USER dc_user

# Essentially running mkdir <name> inside the current working
# directory, and then cd <name>
WORKDIR /usr/src/app
#no chnage made
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

ENV NODE_ENV=development

# RUN npm install
# If you are building your code for production
#USER root
RUN npm ci

# Bundle app source
COPY . .


# Download RDS certificates bundle for SSL verification
ADD --chown=dc_user https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem ./ca/rds-combined-ca-bundle.pem
# Expose port 3100 inside the container to the outside world
# so that http://localhost:3100 routes the network traffic to
# the container
EXPOSE 3100

USER 1015
# the command line to run when the container is started
CMD [ "npm", "start" ]
