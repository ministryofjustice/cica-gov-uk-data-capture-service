# lets start from an image that already has nodejs installed
FROM node:10.13.0

# Essentially running mkdir <name> inside the current working
# directory, and then cd <name>
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm install --only=production

# Bundle app source
COPY . .

# Expose port 3100 inside the container to the outside world
# so that http://localhost:3100 routes the network traffic to
# the container
EXPOSE 3100

# the command line to run when the container is started
CMD [ "npm", "start" ]
