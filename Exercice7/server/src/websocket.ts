import { HttpServer } from './httpserver';
import * as ws from 'ws';

export type Socket = ws;

interface IOnConnection {
  (id: number, socket: ws): void;
}

interface IOnMessage {
  (id: number, socket: ws, data: Buffer): void;
}

interface IOnClose {
  (id: number, socket: ws, evt: {}): void;
}

interface IOnError {
  (id: number, socket: ws, evt: {}): void;
}

export class WebSocket {
  private wsServer: ws.Server;
  private nextId = 1;
  onConnection: IOnConnection = () => { };
  onMessage: IOnMessage = () => { };
  onClose: IOnClose = () => { };
  onError: IOnError = () => { };

  constructor(private httpServer: HttpServer) {
    if (!httpServer) {
      throw new Error('Le serveur doit être spécifié!');
    }

    this.wsServer = new ws.Server({
      server: httpServer.server,
    });

    this.wsServer.on('connection', (socket) => {
      let id = this.nextId++;

      socket.onmessage = (evt) => {
        this.onMessage(id, socket, Buffer.from(<Buffer> evt.data));
      };
      socket.onclose = (evt) => {
        this.onClose(id, socket, evt);
      };
      socket.onerror = (evt) => {
        this.onError(id, socket, evt);
      };
      this.onConnection(id, socket);
    });
  }

  close() {
    this.wsServer.close();
  }
}