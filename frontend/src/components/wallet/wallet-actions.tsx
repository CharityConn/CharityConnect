import { Component, h, Prop, State } from '@stencil/core';
import { getWalletInfo, WalletInfo } from './WalletInfo';
import { WalletConnection, Web3WalletProvider } from './Web3WalletProvider';

@Component({
  tag: 'wallet-actions',
  styleUrl: 'wallet-actions.css',
  shadow: false,
  scoped: false,
})
export class WalletSelector {
  @Prop()
  onClick: (e: Event) => void;

  @State()
  walletInfo?: WalletInfo & WalletConnection;

  async connectedCallback() {
    const wallet = await Web3WalletProvider.getWallet();
    await this.updateWalletConnectionState(wallet);

    Web3WalletProvider.registerWalletChangeListener(this.updateWalletConnectionState.bind(this));
  }

  async disconnectedCallback() {
    Web3WalletProvider.removeWalletChangeListener(this.updateWalletConnectionState.bind(this));
  }

  private async updateWalletConnectionState(wallet: WalletConnection) {
    if (!wallet) {
      this.walletInfo = null;
      return;
    }

    this.walletInfo = { ...wallet, ...getWalletInfo(wallet.providerType) };
  }

  render() {
    return (
      <div class="action-items">
        <div class="action-item">
          <img src="assets/icon/wallet-connect/copy-icon.svg" width={19} height={19} />
          <button
            onClick={async e => {
              this.onClick(e);
              await navigator.clipboard.writeText(this.walletInfo.address);
            }}
          >
            Copy address
          </button>
        </div>
        <div class="action-item">
          <img src="assets/icon/wallet-connect/switch-icon.svg" width={19} height={19} />
          <button
            onClick={e => {
              this.onClick(e);
              Web3WalletProvider.switchWallet();
            }}
          >
            Switch wallet
          </button>
        </div>
        <div class="action-item">
          <img src="assets/icon/wallet-connect/disconnect-icon.svg" width={19} height={19} />
          <button
            onClick={e => {
              this.onClick(e);
              Web3WalletProvider.disconnectWallet();
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }
}
