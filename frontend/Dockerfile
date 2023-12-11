FROM node:18

RUN npm i -g pnpm

WORKDIR /app

COPY package.json .

COPY pnpm-lock.yaml .

COPY . .

RUN pnpm i --frozen-lockfile

EXPOSE 8080

CMD [ "pnpm", "run" ,"dev", "--strict-port", "--port", "8080", "--host", "--clearScreen=false" ]

