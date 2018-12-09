import { ISerializer, IDeserializer } from '../../common/serializer';

// # Classe *Serializer*
// Classe utilitaire pour la sérialisation de données en un
// format binaire.
export class Serializer implements ISerializer {
  private data: Buffer[] = [];

  writeU8(v: number) {
    this.data.push(new Buffer([v]));
  }

  writeU32(v: number) {
    const buf = new Buffer(4);
    buf.writeUInt32LE(v, 0);
    this.data.push(buf);
  }

  writeString(s: string) {
    const buf = new Buffer(s, 'utf8');
    this.writeU8(buf.length);
    this.data.push(buf);
  }

  toBinary() {
    return Buffer.concat(this.data);
  }
}

// # Classe *Deserializer*
// Classe utilitaire pour la désérialisation de données en un
// format binaire.
export class Deserializer implements IDeserializer {
  offset = 0;

  constructor(private buffer: Buffer) {
  }

  peekU8() {
    return this.buffer.readUInt8(this.offset);
  }

  readU8() {
    const ret = this.peekU8();
    this.offset++;
    return ret;
  }

  peekU32() {
    return this.buffer.readUInt32LE(this.offset);
  }

  readU32() {
    const ret = this.peekU32();
    this.offset += 4;
    return ret;
  }

  readString() {
    const length = this.readU8();
    const ret = this.buffer.toString('utf8', this.offset, this.offset + length);
    this.offset += length;
    return ret;
  }
}