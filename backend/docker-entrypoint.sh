#!/bin/sh

pnpx prisma migrate deploy
pnpx prisma db seed

pnpm run start:dev
