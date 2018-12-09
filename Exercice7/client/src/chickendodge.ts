import { run, IConfig } from './main';
import { Localisation, ILocaleFiles } from './localisation';

const locales: ILocaleFiles = {
  fr: 'locales/fr.json',
  en: 'locales/en.json',
};

interface IStartFn {
  (): void;
}
let startFn: IStartFn;

export function start() {
  startFn();
}

export function init() {
  return Localisation.init(locales)
    .then(() => {
      const localized = <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName('localized');
      Array.from(localized).forEach((item) => {
        item.innerText = Localisation.get(item.innerText);
      });
      document.getElementById('body')!.style.display = 'initial';

      startFn = () => {
        const alias = (<HTMLInputElement>document.getElementById('player_alias'))!.value.trim();
        const server = (<HTMLInputElement>document.getElementById('server'))!.value.trim();

        if (alias.length === 0)
          return alert(Localisation.get('EMPTY_ALIAS'));
        if (server.length === 0)
          return alert(Localisation.get('EMPTY_SERVER'));

        const config: IConfig = {
          canvasId: 'canvas',
          alias: alias,
          server: server,
          launchScene: 'scenes/play.json'
        };

        Localisation.setContext('PLAYER_1', alias);

        document.getElementById('config')!.style.display = 'none';
        document.getElementById('canvas')!.style.display = 'block';

        return run(config);
      };
    });
}