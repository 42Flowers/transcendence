FROM node:18

WORKDIR /build

RUN npm i -g pnpm

COPY package.json .

COPY pnpm-lock.yaml .

RUN pnpm i --frozen-lockfile

COPY . .

CMD [ "npx", "vite", "build", "--outDir", "/build/dist" ]
