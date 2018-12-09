import { Component } from './component';
import { NetworkingComponent } from './networkingComponent';
import { IInputComponent } from './inputComponent';
import { ILogicComponent } from '../logicSystem';
import { NetworkMessage, NetworkInputChanged } from '../../../common/messages';

interface IInputSymbol {
  [key: string]: boolean;
}

// # Classe *NetworkInputComponent*
// Ce composant envoie ou récupère les actions des joueurs
// sur le réseau.
interface INetInputCompDesc {
  networking: string;
  localInput: string;
}

export class NetworkInputComponent extends Component<INetInputCompDesc> implements IInputComponent, ILogicComponent {
  isLocal = true;
  private networking!: NetworkingComponent;
  private localInput!: IInputComponent;
  private inputStatus: IInputSymbol = {};

  // ## Méthode *setup*
  // Cette méthode configure le composant. Elle conserve une
  // référence vers le module local d'entrée, afin de l'utiliser
  // si on est le joueur local.
  setup(descr: INetInputCompDesc) {
    this.networking = Component.findComponent<NetworkingComponent>(descr.networking)!;
    this.localInput = Component.findComponent<IInputComponent>(descr.localInput)!;
    this.localInput.listSymbols().forEach((k) => {
      this.inputStatus[k] = false;
    });

    this.networking.messageEvent.add(this, this.onMessage);
  }

  // ## Méthode *update*
  // Met à jour l'état des entrées.
  update() {
    if (this.isLocal) {
      this.updateLocal();
    }
  }

  // ## Méthode *updateLocal*
  // Met à jour les entrées locales et envoie les changements,
  // si il y a lieu
  private updateLocal() {
    let changed = false;
    Object.keys(this.inputStatus).forEach((k) => {
      const newVal = this.localInput.getKey(k);
      if (newVal !== this.inputStatus[k]) {
        changed = true;
        this.inputStatus[k] = newVal;
      }
    });

    if (changed) {
      const msg = new NetworkInputChanged();
      msg.build(this.inputStatus);
      this.networking.send(msg);
    }
  }

  // ## Méthode *onMessage*
  // Cette méthode est déclenchée quand un message réseau est reçu,
  // si on a le message du type désiré, on met à jour l'état des
  // entrées.
  private onMessage(msg: NetworkMessage) {
    if (this.isLocal) {
      return;
    }

    if (msg instanceof NetworkInputChanged) {
      this.inputStatus = msg.symbols;
    }
  }

  listSymbols() {
    return this.localInput.listSymbols();
  }

  // ## Fonction *getKey*
  // Cette méthode retourne une valeur correspondant à un symbole défini.
  getKey(symbol: string) {
    return this.inputStatus[symbol] || false;
  }
}
