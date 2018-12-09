import { Component } from './component';
import { TextSpriteComponent } from './textSpriteComponent';
import { EventTrigger } from '../eventTrigger';
import { NetworkScore, IScoreDesc } from '../../../common/messages';
import { NetworkingComponent } from './networkingComponent';
import { GlobalConfig } from '../main';

// # Classe *ScoreComponent*
interface IScoreComponentDesc {
  scoreSprite: string;
}

export class ScoreComponent extends Component<IScoreComponentDesc> {
  private scoreChangedEvent = new EventTrigger();
  private scoreSprite!: TextSpriteComponent;
  private _value!: number;
  private scoreDesc!: IScoreDesc;
  private networking!: NetworkingComponent;

  // ## Méthode *setup*
  // Cette méthode conserve le composant de texte qui affiche
  // le pointage, et initialise sa valeur.
  setup(descr: IScoreComponentDesc) {
    this.scoreSprite = Component.findComponent<TextSpriteComponent>(descr.scoreSprite)!;
    this.networking = Component.findComponent<NetworkingComponent>(descr.networking)!;
    this.value = 0;

  }

  // ## Propriété *value*
  // Cette méthode met à jour le pointage et l'affichage de
  // ce dernier.
  get value() {
    return this._value;
  }

  set value(newVal) {
    this._value = newVal;
    this.scoreChangedEvent.trigger(this.value);
    this.scoreSprite.text = this.value.toString();
  }

  sendScore(n : number){
    const msg = new NetworkScore();
    this.scoreDesc.score = n;
    this.scoreDesc.name = GlobalConfig.alias;
    msg.build(this.scoreDesc);
    this.networking.send(msg);
  }
}
