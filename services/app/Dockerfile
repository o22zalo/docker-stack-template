FROM litestream/litestream:0.5 AS litestream

FROM diegosouzapw/omniroute:latest

USER root

COPY --from=litestream /usr/local/bin/litestream /usr/local/bin/litestream
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY litestream.yml /etc/litestream.yml

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
