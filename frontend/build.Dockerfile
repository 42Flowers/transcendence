FROM node:18

WORKDIR /build

COPY package.json .

COPY yarn.lock .

RUN yarn install --frozen-lockfile --non-interactive

COPY . .

CMD [ "npx", "vite", "build", "--outDir", "/build/dist" ]
