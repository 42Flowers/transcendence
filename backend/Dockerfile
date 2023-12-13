FROM node:18

EXPOSE 3000

ARG DATABASE_URL
ARG FT_APP_ID
ARG FT_APP_SECRET
ARG JWT_SECRET

WORKDIR /app

COPY package.json .

COPY yarn.lock .

COPY . .

RUN yarn install --frozen-lockfile --non-interactive

RUN yarn run build

COPY --chmod=744 ./docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT "/docker-entrypoint.sh"
