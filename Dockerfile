FROM node:24

WORKDIR /app
COPY package*.json ./

RUN corepack enable
RUN yarn --version
RUN yarn install
RUN yarn dlx puppeteer browsers install

COPY . .
CMD ["yarn", "start"]