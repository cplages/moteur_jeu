import { Component } from './component';
import * as Utils from '../utils';

// Conserve une référence vers le composant audio principal
let mainAudio: AudioComponent | undefined = undefined;

// Crée un contexte audio du navigateur
const globalContext = new AudioContext();

// # Classe *AudioComponent*
// Ce composant représente un module permettant de jouer des sons.
interface IAudioComponentDesc {
  main?: boolean;
  description: string;
}

interface IEventDescr {
  source: string;
  volume: number;
  audioBuffer?: AudioBuffer;
}

interface IEvents {
  [name: string]: IEventDescr;
}

export class AudioComponent extends Component<IAudioComponentDesc> {
  private events: IEvents = {};

  // ## Méthode *create*
  // Cette méthode est appelée pour configurer le composant avant
  // que tous les composants d'un objet aient été créés.
  create(descr: IAudioComponentDesc) {
    if (descr.main) {
      mainAudio = this;
    }
  }

  // ## Méthode *setup*
  // Cette méthode charge le fichier de description et les sons
  // qui y sont associés.
  setup(descr: IAudioComponentDesc) {
    function decodeAudioData(arrayBuffer: ArrayBuffer) {
      return new Promise<AudioBuffer>((resolve) => {
        globalContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        });
      });
    }

    return Utils.loadJSON<IEvents>(descr.description)
      .then((events) => {
        const p: Promise<any>[] = [];
        Object.keys(events).forEach((name) => {
          const evtDesc = events[name];
          const loadP = Utils.loadAsync(evtDesc.source, undefined, 'arraybuffer')
            .then((xhr) => {
              return decodeAudioData(xhr.response);
            })
            .then((buffer) => {
              evtDesc.audioBuffer = buffer;
              this.events[name] = evtDesc;
            });
          p.push(loadP);
        });
        return Promise.all(p);
      });
  }

  // ## Méthode *play*
  // Cette méthode joue le son désiré selon son nom.
  play(name: string, volume = 1.0) {
    if (!this.events[name])
      return;

    const source = globalContext.createBufferSource();
    source.buffer = this.events[name].audioBuffer!;
    const gainNode = globalContext.createGain();
    gainNode.gain.value = this.events[name].volume * volume;
    source.connect(gainNode);
    gainNode.connect(globalContext.destination);
    source.start(0);
  }

  // ## Méthode statique *play*
  // Cette méthode joue le son désiré sur le composant principal.
  static play(name: string, volume = 1.0) {
    mainAudio!.play(name, volume);
  }
}
