import '../../integration/rum';

import { Component, Element, Host, JSX, Listen, Method, h, State } from '@stencil/core';
import { TokenScriptEngine } from '@tokenscript/engine-js/dist/lib.esm/Engine';

import { TokenScript } from '@tokenscript/engine-js/dist/lib.esm/TokenScript';
import { ITokenDiscoveryAdapter } from '@tokenscript/engine-js/dist/lib.esm/tokens/ITokenDiscoveryAdapter';
import { EthersAdapter } from '@tokenscript/engine-js/dist/lib.esm/wallet/EthersAdapter';
import { IWalletAdapter } from '@tokenscript/engine-js/dist/lib.esm/wallet/IWalletAdapter';
import { ethers } from 'ethers';
import { IFrameEthereumProvider } from '../../integration/IframeEthereumProvider';
import { AttestationStorageAdapter } from '../../integration/attestationStorageAdapter';
import { CHAIN_CONFIG } from '../../integration/constants';
import { DiscoveryAdapter } from '../../integration/discoveryAdapter';
import { LocalStorageAdapter } from '../../integration/localStorageAdapter';
import { dbProvider } from '../../providers/databaseProvider';
import { showToastNotification } from '../viewers/util/showToast';
import { WalletConnection, Web3WalletProvider } from '../wallet/Web3WalletProvider';

export type TokenScriptSource = 'resolve' | 'file' | 'url';

export interface ShowToastEventArgs {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string | JSX.Element;
}

export type ViewerTypes = 'tabbed' | 'integration' | 'new' | 'joyid-token' | 'opensea' | 'sts-token' | 'alphawallet' | 'mooar';

const IFRAME_PROVIDER_VIEWS: ViewerTypes[] = ['joyid-token', 'sts-token', 'mooar'];

const initViewerType = (params: URLSearchParams): ViewerTypes => {
  let viewerType;

  switch (params.get('viewType')) {
    case 'integration':
      viewerType = 'integration';
      break;
    case 'tabbed':
      viewerType = 'tabbed';
      break;
    case 'joyid-token':
      viewerType = 'joyid-token';
      break;
    case 'animationUrl':
    case 'opensea':
    case 'marketplace':
      viewerType = 'opensea';
      break;
    case 'sts-token':
      viewerType = 'sts-token';
      break;
    case 'alphawallet':
      viewerType = 'alphawallet';
      break;
    case 'mooar':
      viewerType = 'mooar';
      break;
    // Fall-through to default
    case 'new':
    default:
      viewerType = 'new';
  }

  return viewerType;
};

@Component({
  tag: 'app-root',
  styleUrl: 'app.css',
  shadow: false,
})
export class AppRoot {
  @State()
  private walletConnection: WalletConnection;

  walletSelector: HTMLWalletSelectorElement;

  discoveryAdapter: ITokenDiscoveryAdapter = new DiscoveryAdapter();
  attestationStorageAdapter = new AttestationStorageAdapter();
  tsLocalStorageAdapter = new LocalStorageAdapter();

  private iframeProvider: ethers.BrowserProvider;

  private confirmTxPopover: HTMLConfirmTxPopoverElement;

  private params = new URLSearchParams(document.location.search);
  private viewerType: ViewerTypes = initViewerType(this.params);

  public readonly tsEngine: TokenScriptEngine;

  constructor() {
    if (this.viewerType !== 'opensea') dbProvider.checkCompatibility();

    this.tsEngine = new TokenScriptEngine(
      async () => this.getWalletAdapter(),
      async () => this.discoveryAdapter,
      () => this.attestationStorageAdapter,
      () => this.tsLocalStorageAdapter,
      {
        noLocalStorage: this.viewerType === 'opensea',
        trustedKeys: [
          {
            issuerName: 'Smart Token Labs',
            valueType: 'ethAddress',
            value: '0x1c18e4eF0C9740e258835Dbb26E6C5fB4684C7a0',
          },
          {
            issuerName: 'Smart Token Labs',
            valueType: 'ethAddress',
            value: '0xf68b9DbfC6C3EE3323Eb9A3D4Ed8eb9d2Cb45A30',
          },
          {
            issuerName: 'Smart Token Labs',
            valueType: 'ethAddress',
            value: '0x8646DF47d7b16Bf9c13Da881a2D8CDacDa8f5490',
          },
        ],
        txValidationCallback: txInfo => {
          // TODO: This is temporarily disabled to add support for contracts not defined in the tokenscript
          return true;
          //return this.confirmTxPopover.confirmTransaction(txInfo);
        },
      },
    );
  }

  async getWalletAdapter(): Promise<IWalletAdapter> {
    let providerFactory;

    if (this.shouldUseIframeProvider()) {
      providerFactory = async () => {
        if (!this.iframeProvider) this.iframeProvider = new ethers.BrowserProvider(new IFrameEthereumProvider(), 'any');
        return this.iframeProvider;
      };
    } else if (this.viewerType === 'opensea') {
      providerFactory = async () => {
        throw new Error('PROVIDER DISABLED');
      };
    } else if (this.viewerType === 'alphawallet') {
      // Automatically connect to injected web3 provider
      providerFactory = async () => {
        const WalletProvider = (await import('../wallet/Web3WalletProvider')).Web3WalletProvider;
        if (!WalletProvider.isWalletConnected()) await WalletProvider.connectWith('MetaMask');
        return (await WalletProvider.getWallet(true)).provider;
      };
    } else {
      providerFactory = async () => {
        return (await (await import('../wallet/Web3WalletProvider')).Web3WalletProvider.getWallet(true)).provider;
      };
    }

    return new EthersAdapter(providerFactory, CHAIN_CONFIG);
  }

  private shouldUseIframeProvider() {
    return IFRAME_PROVIDER_VIEWS.indexOf(this.viewerType) > -1 && !this.params.has('noIframeProvider');
  }

  @Element() host: HTMLElement;

  loadTimer = null;

  @Listen('showLoader')
  showLoaderHandler(_event: CustomEvent<void>) {
    this.showTsLoader();
  }

  showTsLoader() {
    // this.loadTimer = setTimeout(() => (document.getElementById('ts-loader').style.display = 'flex'), 50);
  }

  @Listen('hideLoader')
  hideLoaderHandler(_event: CustomEvent<void>) {
    this.hideTsLoader();
  }

  hideTsLoader() {
    clearTimeout(this.loadTimer);
    document.getElementById('ts-loader').style.display = 'none';
  }

  @Method()
  async loadTokenscript(source: TokenScriptSource, tsId?: string, file?: File | string): Promise<TokenScript> {
    switch (source) {
      case 'resolve':
        return this.tsEngine.getTokenScript(tsId);
      case 'file':
        if (typeof file === 'string') {
          return this.tsEngine.loadTokenScript(file);
        } else {
          return this.loadTokenScriptFromFile(file);
        }
      case 'url':
        return this.tsEngine.getTokenScriptFromUrl(tsId);
    }
  }

  async loadTokenScriptFromFile(file: File): Promise<TokenScript> {
    return new Promise<TokenScript>((resolve, reject) => {
      // const file = (document.getElementById("ts-file") as HTMLInputElement).files[0];

      if (file) {
        this.showTsLoader();

        const reader = new FileReader();
        reader.onload = async function (evt) {
          if (typeof evt.target.result === 'string') {
            try {
              resolve(await this.tsEngine.loadTokenScript(evt.target.result));
            } catch (e) {
              reject('Failed to load TokenScript: ' + e.message);
            }
          }
        }.bind(this);

        reader.onerror = function (err) {
          reject('Failed to load file: ' + err.message);
        }.bind(this);

        reader.readAsText(file, 'UTF-8');

        return;
      }

      reject('No file selected');
    });
  }

  @Listen('showToast')
  showToastHandler(event: CustomEvent<ShowToastEventArgs>) {
    this.showToast(event.detail.type, event.detail.title, event.detail.description);
  }

  @Method()
  async showToast(type: 'success' | 'info' | 'warning' | 'error', title: string, description: string | JSX.Element) {
    return showToastNotification(type, title, description);
  }

  componentWillLoad() {
    Web3WalletProvider.registerWalletChangeListener(async (walletConnection?: WalletConnection) => {
      this.walletConnection = walletConnection;
    });
  }

  async componentDidLoad() {
    if (!this.shouldUseIframeProvider() && this.viewerType !== 'opensea') {
      const Web3WalletProvider = (await import('../wallet/Web3WalletProvider')).Web3WalletProvider;
      Web3WalletProvider.setWalletSelectorCallback(async () => this.walletSelector.connectWallet());
      await Web3WalletProvider.loadConnections();
    }
  }

  render() {
    return (
      <Host>
        <div class="app-container">
          <cb-toast class="toast" style={{ zIndex: '500' }}></cb-toast>
          <header class="header">
            <img class="header-icon" alt="TokenScript icon" src="assets/images/charity-connect-banner.png" />
            <div class="header-actions">
              {this.walletConnection && <wallet-button></wallet-button>}
            </div>
          </header>

          <main>
            {this.viewerType === 'tabbed' ? <tabbed-viewer app={this}></tabbed-viewer> : ''}
            {this.viewerType === 'integration' ? <integration-viewer app={this}></integration-viewer> : ''}
            {this.viewerType === 'new' ? <new-viewer app={this}></new-viewer> : ''}
          </main>

          <confirm-tx-popover ref={elem => (this.confirmTxPopover = elem)} />

          <div id="ts-loader">
            <loading-spinner />
          </div>
        </div>
        {!this.shouldUseIframeProvider() && this.viewerType !== 'opensea' ? <wallet-selector ref={el => (this.walletSelector = el)}></wallet-selector> : ''}
      </Host>
    );
  }
}
