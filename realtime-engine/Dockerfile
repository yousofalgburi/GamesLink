FROM node:21.7

# Working Directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Prettier
RUN npm install -g prettier

# Install Dependencies
RUN npm install

# Copy Source Code
COPY . .

# Build
RUN npm run build

# Expose Port
EXPOSE 8000

CMD [ "node", "dist/server.js" ]