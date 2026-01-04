FROM node:24

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY . .

RUN corepack enable

RUN apt-get update && apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

ENTRYPOINT ["/entrypoint.sh"]
