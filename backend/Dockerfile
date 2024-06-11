FROM node:20-alpine AS builder

COPY . /usr/src/app/
RUN apk add --no-cache git python3 make g++
RUN --mount=type=cache,target=/root/.npm \
    cd /usr/src/app/ && \
    npm ci -d --foreground-scripts && \
    npm run build

FROM node:20-alpine
LABEL org.opencontainers.image.authors="Feng Yu<abcfy2@163.com>"

COPY --from=0 /usr/src/app/dist/ /usr/src/app/
ENV FASTIFY_PORT=3006
ENV FASTIFY_ADDRESS=0.0.0.0
EXPOSE ${FASTIFY_PORT}

RUN apk add --no-cache tini su-exec
RUN adduser -s /bin/false -S -D -H app

ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["su-exec", "app", "node", "/usr/src/app/index.js"]
