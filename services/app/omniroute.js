const http = require("http");

class OmniRoute {
  constructor() {
    this.middlewares = [];
    this.routes = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  get(path, handler) {
    this.routes.push({ method: "GET", path, handler });
    return this;
  }

  createServer() {
    return http.createServer(async (req, res) => {
      res.json = (payload, status = 200) => {
        const body = JSON.stringify(payload);
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(body);
      };

      const handlers = [
        ...this.middlewares,
        (req_, res_) => {
          const route = this.routes.find((item) => item.method === req_.method && item.path === req_.url.split("?")[0]);
          if (!route) {
            res_.json({ error: "Not Found" }, 404);
            return;
          }
          route.handler(req_, res_);
        },
      ];

      let index = 0;
      const next = () => {
        const handler = handlers[index++];
        if (handler) {
          handler(req, res, next);
        }
      };

      next();
    });
  }

  listen(port, callback) {
    const server = this.createServer();
    server.listen(port, callback);
    return server;
  }
}

module.exports = { OmniRoute };
