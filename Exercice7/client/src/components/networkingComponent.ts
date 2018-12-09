import { Component } from './component';
import { Serializer, Deserializer } from '../serializer';
import { EventTrigger } from '../eventTrigger';
import { GlobalConfig } from '../main';
import { NetworkMessage } from '../../../common/messages';

// # Classe *NetworkingComponent*
// Ce composant s'occupe des communications réseau.
export class NetworkingComponent extends Component<Object> {
  messageEvent = new EventTrigger();
  private socket!: WebSocket;

  // ## Méthode *create*
  // Cette méthode est appelée pour configurer le composant avant
  // que tous les composants d'un objet aient été créés.
  create() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`ws://${GlobalConfig.server}`, 'ChickenDodge');
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
      this.socket.onmessage = (evt) => {
        this.onMessage(evt.data);
      };
    });
  }

  // ## Méthode *onMessage*
  // Cette méthode reçoit les messages reçus du réseau, crée le
  // message désiré dans notre format, et l'envoie aux modules
  // concernés.
  private onMessage(blob: Blob) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const deserializer = new Deserializer(<ArrayBuffer> reader.result);
      const msg = NetworkMessage.create(deserializer);
      this.messageEvent.trigger(msg);
    };
    reader.readAsArrayBuffer(blob);
  }

  // ## Méthode *send*
  // Cette méthode est appelée par les autres composants afin
  // d'envoyer un message au serveur.
  send(message: NetworkMessage) {
    const serializer = new Serializer();
    message.serialize(serializer);
    this.socket.send(serializer.toBinary());
  }
}
