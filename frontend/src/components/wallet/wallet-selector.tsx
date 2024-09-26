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
  smartWallet: WalletInfo;

  @State()
  otherWallets: WalletInfo[];

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

    if (typeof window.ethereum !== 'undefined') {
      providers.push(getWalletInfo(SupportedWalletProviders.MetaMask));
    }

    providers.push(getWalletInfo(SupportedWalletProviders.WalletConnectV2));
    // providers.push(getWalletInfo(SupportedWalletProviders.Torus));

    // if (typeof window.gatewallet !== 'undefined') {
    //   providers.push(getWalletInfo(SupportedWalletProviders.Gate));
    // }

    this.smartWallet = getWalletInfo(SupportedWalletProviders.SmartWallet);
    this.otherWallets = providers;
  }

  componentDidLoad() {
    //this.dialog.openDialog();
  }

  render() {
    return (
      <popover-dialog class="wallet-selector" ref={el => (this.dialog = el as HTMLPopoverDialogElement)}>
        <p class="popover-title">New to Crypto? Start Here</p>
        <div class="popover-notes">
          <p>Claim and use your free membership card with Smart Wallet - no fees required!</p>
        </div>
        <button
          class="btn wallet-btn"
          onClick={() => {
            this.selectCallback(this.smartWallet.name);
            this.dialog.closeDialog();
          }}
        >
          <div class="wallet-icon" innerHTML={this.smartWallet.imgBig} style={{ overflow: 'hidden' }}></div>
          <div class="wallet-name">{this.smartWallet.label}</div>
        </button>

        <p class="popover-title">Already Have a Wallet?</p>
        <div class="popover-notes">
          <p>Claim and use your membership card with your preferred wallet.</p>
        </div>

        {this.otherWallets.map(provider => {
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
