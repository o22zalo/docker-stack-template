FROM litestream/litestream:0.5 AS litestream

FROM node:20-alpine

RUN addgroup -S appgroup \
  && adduser -S appuser -G appgroup \
  && apk add --no-cache sqlite

WORKDIR /app

COPY --from=litestream /usr/local/bin/litestream /usr/local/bin/litestream

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .
COPY litestream.yml /etc/litestream.yml

RUN mkdir -p /app/logs /data \
  && chown -R appuser:appgroup /app /data /etc/litestream.yml

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
