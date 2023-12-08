FROM node:18

ARG DATABASE_URL
ARG FT_APP_ID
ARG FT_APP_SECRET
ARG JWT_SECRET

RUN npm i -g pnpm

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

COPY . .

RUN pnpm i --frozen-lockfile

RUN pnpx prisma generate

COPY --chmod=744 docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT [ "/docker-entrypoint.sh" ]
