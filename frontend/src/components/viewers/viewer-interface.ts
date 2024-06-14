import { TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';

export interface ViewerInterface {
  getTokenScript(): TokenScript;
  openTokenScript(tokenScript: TokenScript): void;
}
