import { Component, h, Method, State } from '@stencil/core';
import { SupportedWalletProviders } from './Web3WalletProvider';
import { getWalletInfo, WalletInfo } from './WalletInfo';

@Component({
  tag: 'wallet-selector',
  styleUrl: 'wallet-selector.css',
  shadow: false,
  scoped: false,
})
export class WalletSelector {
  @State()
  providerList: WalletInfo[];

  private dialog;

  private selectCallback: (res: SupportedWalletProviders) => void;

  private closeCallback: (error: string) => void;

  @Method()
  async connectWallet(): Promise<SupportedWalletProviders> {
    this.dialog.openDialog(() => {
      this.closeCallback('Wallet connection aborted.');
    });

    return new Promise((resolve, reject) => {
      this.selectCallback = resolve;
      this.closeCallback = reject;
    });
  }

  componentWillLoad() {
    const providers = [];

    providers.push(getWalletInfo(SupportedWalletProviders.SmartWallet));
    if (typeof window.ethereum !== 'undefined') {
      providers.push(getWalletInfo(SupportedWalletProviders.MetaMask));
    }
    // providers.push(getWalletInfo(SupportedWalletProviders.WalletConnect));
    providers.push(getWalletInfo(SupportedWalletProviders.WalletConnectV2));
    providers.push(getWalletInfo(SupportedWalletProviders.Torus));

    if (typeof window.gatewallet !== 'undefined') {
      providers.push(getWalletInfo(SupportedWalletProviders.Gate));
    }

    this.providerList = providers;
  }

  componentDidLoad() {
    //this.dialog.openDialog();
  }

  render() {
    return (
      <popover-dialog class="wallet-selector" ref={el => (this.dialog = el as HTMLPopoverDialogElement)}>
        <p class="popover-title">Connect Wallet</p>
        <div class="popover-notes">
          <img src="assets/icon/info-icon.svg" width="18" height="18" />
          <p>The membership card is free to claim! The Coinbase Smart Wallet will also save you claiming transaction fees.</p>
        </div>
        {this.providerList.map(provider => {
          return (
            <button
              class="btn wallet-btn"
              onClick={() => {
                this.selectCallback(provider.name);
                this.dialog.closeDialog();
              }}
            >
              <div class="wallet-icon" innerHTML={provider.imgBig} style={{ overflow: 'hidden' }}></div>
              <div class="wallet-name">{provider.label}</div>
            </button>
          );
        })}
      </popover-dialog>
    );
  }
}
