import * as Utils from './utils';

export interface ILocaleFiles {
  [lang: string]: string;
}

export interface ILocaleContext {
  [key: string]: string;
}

interface ILocaleData {
  [key: string]: string;
}

interface IQueryParams {
  [key: string]: string;
}

const globalContext: ILocaleContext = {};
let localeStrings: ILocaleData = {};

// ## Fonction *getQueryParams*
// Cette fonction retourne un objet contenant les paramètres passés
// à l'URL de la page.
function getQueryParams() {
  const query = document.location.search;
  const queryParams: IQueryParams = {};

  const regex = new RegExp('([^?=&]+)(=([^&]*))?', 'g');
  query.replace(regex, (match, p1, p2, p3) => {
    queryParams[p1] = p3;
    return '';
  });

  return queryParams;
}

// # Classe *Localisation*
// Cette classe comprend les méthodes nécessaires pour
// charger et traiter la régionalisation.
export class Localisation {
  // ## Méthode statique *init*
  // La méthode d'initialisation prend en paramètre un tableau
  // associatif décrivant les différents fichiers de localisation.
  // On détermine le fichier de locales à utiliser selon la langue
  // du navigateur ou un paramètre passé dans l'URL.
  static init(locales: ILocaleFiles) {
    const queryParams = getQueryParams();
    let language = queryParams.locale || navigator.language;
    language = language.substring(0, 2);
    if (!locales[language]) {
      language = Object.keys(locales)[0];
    }

    return Utils.loadJSON<ILocaleData>(locales[language])
      .then((content) => {
        localeStrings = content;
      });
  }

  // ## Fonction statique *get*
  // Cette fonction retourne la chaîne correspondante à la clé demandée.
  // Si cette chaîne comprend des champs substitués, ceux-ci sont remplacés.
  static get(key: string, queryContext: ILocaleContext = {}) {
    Object.keys(globalContext).forEach((k) => {
      if (queryContext[k]) {
        return;
      }

      queryContext[k] = globalContext[k];
    });

    if (!localeStrings[key]) {
      console.error(`Failed to find locale for ${key}`);
      return key;
    }

    // key substitution
    Object.keys(queryContext).forEach((k) => {
      localeStrings[key] = localeStrings[key].replace("{" + k + "}", queryContext[k]);
    });

    return localeStrings[key];
  }

  // ## Méthode statique *setContext*
  // Cette méthode assigne une valeur au contexte
  // global qui sera substituée par défaut.
  static setContext(key: string, val: string) {
    globalContext[key] = val;
  }

  // ## Méthode statique *getContext*
  // Cette méthode obtient une valeur du contexte global.
  static getContext(key: string) {
    return globalContext[key];
  }
}
