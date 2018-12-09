import { ISerializer, IDeserializer } from '../../common/serializer';

// # Classe *Serializer*
// Classe utilitaire pour la sérialisation de données en un
// format binaire.
export class Serializer implements ISerializer {
  private data: (Uint8Array | Uint32Array)[] = [];

  writeU8(v: number) {
    this.data.push(new Uint8Array([v]));
  }

  writeU32(v: number) {
    this.data.push(new Uint32Array([v]));
  }

  writeString(s: string) {
    const encoder = new TextEncoder();
    const buf = encoder.encode(s);
    this.writeU8(buf.length);
    this.data.push(buf);
  }

  toBinary() {
    return new Blob(this.data);
  }
}

// # Classe *Deserializer*
// Classe utilitaire pour la désérialisation de données en un
// format binaire.
export class Deserializer implements IDeserializer {
  private dv: DataView;
  private offset = 0;

  constructor(arrayBuffer: ArrayBuffer) {
    this.dv = new DataView(arrayBuffer);
  }

  peekU8() {
    return this.dv.getUint8(this.offset);
  }

  readU8() {
    const ret = this.peekU8();
    this.offset++;
    return ret;
  }

  peekU32() {
    return this.dv.getUint32(this.offset, true);
  }

  readU32() {
    const ret = this.peekU32();
    this.offset += 4;
    return ret;
  }

  readString() {
    const length = this.readU8();
    const decoder = new TextDecoder('utf8');
    const strView = new DataView(this.dv.buffer, this.dv.byteOffset + this.offset, length);
    const ret = decoder.decode(strView);
    this.offset += length;
    return ret;
  }
}
