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
        const alias1 = (<HTMLInputElement>document.getElementById('player1_alias'))!.value.trim();
        const alias2 = (<HTMLInputElement>document.getElementById('player2_alias'))!.value.trim();

        if (alias1.length === 0)
          return alert(Localisation.get('EMPTY_ALIAS',{ID:'1'}));
        if (alias2.length === 0)
          return alert(Localisation.get('EMPTY_ALIAS',{ID:'2'}));

        const config: IConfig = {
          canvasId: 'canvas',
          alias: [alias1, alias2],
          launchScene: 'scenes/play.json'
        };

        Localisation.setContext('PLAYER_1', alias1);
        Localisation.setContext('PLAYER_2', alias2);

        document.getElementById('config')!.style.display = 'none';
        document.getElementById('canvas')!.style.display = 'block';

        return run(config);
      };
    });
}