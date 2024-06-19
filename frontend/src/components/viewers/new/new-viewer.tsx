import { Component, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';
import { TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { getKnownTokenScriptMetaById, knownTokenScripts } from '../../../constants/knownTokenScripts';
import { CHAIN_MAP } from '../../../integration/constants';
import { DiscoveryAdapter } from '../../../integration/discoveryAdapter';
import { dbProvider, TokenScriptsMeta } from '../../../providers/databaseProvider';
import { AppRoot, ShowToastEventArgs, TokenScriptSource } from '../../app/app';
import { connectEmulatorSocket } from '../util/connectEmulatorSocket';

type LoadedTokenScript = TokenScriptsMeta & { tokenScript?: TokenScript };

@Component({
  tag: 'new-viewer',
  styleUrl: 'new-viewer.css',
  shadow: false,
  scoped: false,
})
export class NewViewer {
  @Prop()
  app: AppRoot;

  private addDialog: HTMLAddSelectorElement;

  private viewerPopover: HTMLViewerPopoverElement;

  private aboutDialog: HTMLPopoverDialogElement;

  @State()
  private myTokenScripts: { [tsId: string]: LoadedTokenScript } = {};

  @State()
  private scriptsLoading = true;

  @State()
  private popularTokenscripts: TokenScriptsMeta[] = [];

  @Event({
    eventName: 'showToast',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  showToast: EventEmitter<ShowToastEventArgs>;

  componentWillLoad() {
    // this.init();
    this.processUrlLoad();
  }

  private async processUrlLoad() {
    // TODO: Support attestation in hash parameters too
    const queryStr = document.location.search.substring(1);

    if (!queryStr) return;

    const query = new URLSearchParams(queryStr);
    let tsMeta;

    if (query.has('ticket') || query.has('attestation')) {
      this.app.showTsLoader();

      try {
        const { definition, tokenScript } = await this.app.tsEngine.importAttestationUsingTokenScript(query);

        // Import completed successfully, add tokenscript to myTokenScripts
        tsMeta = await this.addFormSubmit('url', { tsId: tokenScript.getSourceInfo().tsId, image: definition.meta.image });

        //document.location.hash = "";
        window.history.replaceState({}, document.title, '/');

        this.showToast.emit({
          type: 'success',
          title: 'Attestation imported',
          description: 'Successfully imported ' + definition.meta.name,
        });
      } catch (e) {
        console.error(e);
        this.app.hideTsLoader();
        this.showToast.emit({
          type: 'error',
          title: 'Failed to import attestation',
          description: e.message,
        });
        return;
      }
    } else if (query.has('tokenscriptUrl')) {
      tsMeta = await this.addFormSubmit('url', { tsId: query.get('tokenscriptUrl') });
    } else if (query.has('tsId')) {
      tsMeta = await this.addFormSubmit('resolve', { tsId: query.get('tsId') });
    } else if (query.has('chain') && query.has('contract')) {
      const tsId = query.get('chain') + '-' + query.get('contract');
      tsMeta = await this.addFormSubmit('resolve', { tsId });
    } else if (query.has('emulator')) {
      const emulator = query.get('emulator') ? new URL(decodeURIComponent(query.get('emulator'))).origin : document.location.origin;
      const tsId = emulator + '/tokenscript.tsml';
      tsMeta = await this.addFormSubmit('url', { tsId });
      connectEmulatorSocket(emulator, async () => {
        const tsMeta = await this.addFormSubmit('url', { tsId });
        await this.viewerPopover.close();
        this.viewerPopover.open(tsMeta.tokenScript);
      });
    }

    console.log('open TS', tsMeta);

    if (tsMeta) this.viewerPopover.open(tsMeta.tokenScript);
  }

  private async init() {
    const tokenScriptsMap = {};

    // this.app.showTsLoader();

    for (const tsMeta of await dbProvider.myTokenScripts.toArray()) {
      try {
        const tokenScript = await this.app.loadTokenscript(tsMeta.loadType, tsMeta.tokenScriptId, tsMeta.xml);

        tokenScriptsMap[tsMeta.tokenScriptId] = { ...tsMeta, tokenScript };
      } catch (e) {
        console.error('Failed to load TokenScript definition: ', tsMeta.name);

        if (tsMeta.loadType == 'url' && new URL(tsMeta.tokenScriptId).hostname === 'localhost') continue;

        this.showToast.emit({
          type: 'error',
          title: 'Failed to load TokenScript',
          description: e.message,
        });

        tokenScriptsMap[tsMeta.tokenScriptId] = tsMeta;
      }
    }

    this.myTokenScripts = tokenScriptsMap;
    this.scriptsLoading = false;

    // this.app.hideTsLoader();
  }

  @Watch('myTokenScripts')
  private recalculatePopularTokenScripts() {
    this.popularTokenscripts = knownTokenScripts.filter(tsMeta => {
      return !this.myTokenScripts[tsMeta.tokenScriptId];
    });
  }

  private async addPopularTokenScript(tsMeta: TokenScriptsMeta) {
    this.app.showTsLoader();

    try {
      const tokenScript = await this.app.loadTokenscript('resolve', tsMeta.tokenScriptId);

      await this.addTokenScript(tsMeta, tokenScript);
    } catch (e) {
      console.error(e);
      alert(e.message); // TODO: Add proper error dialog or toast
    }

    this.app.hideTsLoader();
  }

  private async addTokenScript(tsMeta: TokenScriptsMeta, tokenScript: TokenScript) {
    await dbProvider.myTokenScripts.put(tsMeta);

    const loadedTs: LoadedTokenScript = { ...tsMeta, tokenScript };

    this.myTokenScripts = { ...this.myTokenScripts, [loadedTs.tokenScriptId]: loadedTs };
  }

  private async removeTokenScript(tsId: string) {
    // TODO: Replace with dialog
    if (!confirm('Are you sure you want to remove this TokenScript?')) return;

    await dbProvider.myTokenScripts.where('tokenScriptId').equals(tsId).delete();

    const tokenScripts = this.myTokenScripts;
    delete tokenScripts[tsId];

    this.myTokenScripts = { ...this.myTokenScripts };
  }

  // TODO: break up function into small components
  private async addFormSubmit(type: TokenScriptSource, data: { tsId?: string; xml?: File; image?: string }) {
    this.app.showTsLoader();

    try {
      const tokenScript = await this.app.loadTokenscript(type, data.tsId, data.xml);

      const tokenScriptId = tokenScript.getSourceInfo().tsId;

      let meta: TokenScriptsMeta = getKnownTokenScriptMetaById(tokenScriptId);

      if (!meta) {
        meta = {
          tokenScriptId,
          loadType: type,
          name: tokenScript.getLabel() ?? tokenScript.getName() ?? 'Unknown TokenScript',
          xml: type === 'file' ? tokenScript.getXmlString() : null,
        };

        // TODO: This can possibly be moved to tokenscript-button component to allow dynamic update of the icon after it has been added
        if (data.image) {
          meta.iconUrl = data.image;
        } else if (tokenScript.getMetadata().iconUrl && tokenScript.getMetadata().iconUrl.trim()) {
          meta.iconUrl = tokenScript.getMetadata().iconUrl.trim();
        } else {
          const originData = tokenScript.getTokenOriginData()[0];

          if (originData && CHAIN_MAP[originData.chainId]) {
            const discoveryAdapter = new DiscoveryAdapter();
            try {
              const data = await discoveryAdapter.getCollectionMeta(originData, CHAIN_MAP[originData.chainId]);
              meta.iconUrl = data.image;
            } catch (e) {
              console.error('Failed to load tokenscript icon from collection metadata', e);
            }
          }
        }
      }

      await this.addTokenScript(meta, tokenScript);

      await this.addDialog.closeDialog();
      this.app.hideTsLoader();

      return { ...meta, tokenScript };
    } catch (e) {
      console.error(e);
      this.app.hideTsLoader();
      this.showToast.emit({
        type: 'error',
        title: 'Failed to load TokenScript',
        description: e.message,
      });
    }
  }

  render() {
    return (
      <Host>
        <h3>Charity Connect</h3>
        <p>Connect your wallet.</p>
        <div class="toolbar">
          <wallet-button></wallet-button>
        </div>
        <div>
          <pass-section></pass-section>
        </div>
        <add-selector ref={el => (this.addDialog = el as HTMLAddSelectorElement)} onFormSubmit={this.addFormSubmit.bind(this)}></add-selector>
        <viewer-popover ref={el => (this.viewerPopover = el as HTMLViewerPopoverElement)}></viewer-popover>
        <popover-dialog ref={el => (this.aboutDialog = el as HTMLPopoverDialogElement)}>
          <about-tokenscript></about-tokenscript>
        </popover-dialog>
      </Host>
    );
  }
}
