FROM node:20-alpine AS builder

RUN apk add --no-cache python3 g++ make && \
    corepack enable yarn pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.npm pnpm install

COPY . .

RUN pnpm run build

FROM node:20-alpine
LABEL org.opencontainers.image.authors="Feng Yu<abcfy2@163.com>"

RUN apk add --no-cache tini su-exec
RUN adduser -s /bin/false -S -D -H app
COPY --from=0 /usr/src/app/dist/ /usr/src/app/
# dd-trace auto instrumentation does not work with @vercel/ncc bundled packages
# as a workaround, we excluded `fastify` and `pino` from being bundled
# so the service still need to load those packages from `node_modules`
COPY --from=0 /usr/src/app/node_modules /usr/src/app/node_modules/

WORKDIR /usr/src/app/
ENV FASTIFY_PORT=3006
ENV FASTIFY_ADDRESS=0.0.0.0
EXPOSE ${FASTIFY_PORT}

ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["su-exec", "app", "node", "/usr/src/app/index.js"]
