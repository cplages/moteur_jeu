import * as http from 'http';

export interface IHandler {
  (req: http.ServerRequest, res: http.ServerResponse): Promise<any>;
}

interface IMethodHandler {
  [method: string]: IHandler[];
}

export class HttpServer {
  readonly server: http.Server;
  private methodHandlers: IMethodHandler = {};

  constructor() {
    this.server = http.createServer((req, res) => this.onRequest(req, res));
  }

  private onRequest(req: http.ServerRequest, res: http.ServerResponse) {
    const handlers = this.methodHandlers[<string>req.method] || [];
    let p: Promise<any> = Promise.reject({});
    handlers.forEach((h) => {
      p = p.catch(() => {
        return h(req, res);
      });
    });

    return p.catch(() => {
      res.statusCode = 404;
      res.end();
    });
  }

  registerRequestHandler(method: string, handler: IHandler) {
    if (!this.methodHandlers[method]) {
      this.methodHandlers[method] = [];
    }

    this.methodHandlers[method].push(handler);
  };

  listen(port: number) {
    return new Promise((resolve) => {
      this.server.listen(port, resolve);
    });
  }

  close() {
    return new Promise((resolve) => {
      this.server.close(resolve);
    });
  }
}
