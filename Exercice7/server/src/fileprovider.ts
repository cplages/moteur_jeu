import { HttpServer } from './httpserver';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

export class FileProvider {
  constructor(private root: string, private server: HttpServer) {
    if (!root) {
      throw new Error('La racine des fichiers doit être spécifiée!');
    }

    if (!server) {
      throw new Error('Le serveur doit être spécifié!');
    }

    server.registerRequestHandler('GET', (req, res) => this.onGetRequest(req, res));
  }

  private fsStat(filePath: string) {
    return new Promise<fs.Stats>((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return reject(err);
        }
        resolve(stats);
      });
    });
  }

  private onGetRequest(req: http.ServerRequest, res: http.ServerResponse): Promise<any> {
    let url = req.url!.split(/[?#]/)[0];
    if (url.slice(-1) === '/') {
      url += 'index.html';
    }

    const filePath = path.join(this.root, url);
    return this.fsStat(filePath)
      .then((stat) => {
        if (stat.isDirectory()) {
          req.url = url + '/';
          return this.onGetRequest(req, res);
        }
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Cache-Control', 'max-age=-1');
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
      });
  }
}