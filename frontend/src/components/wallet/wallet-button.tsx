import { Component, h, State } from '@stencil/core';
import { getWalletInfo, WalletInfo } from './WalletInfo';
import { WalletConnection, Web3WalletProvider } from './Web3WalletProvider';
import { CHAIN_ID, CHAIN_MAP } from '../../integration/constants';

@Component({
  tag: 'wallet-button',
  styleUrl: 'wallet-button.css',
  shadow: false,
  scoped: false,
})
export class WalletButton {
  @State()
  walletInfo?: WalletInfo & WalletConnection;

  @State()
  dropdownOpened = false;

  async connectedCallback() {
    const wallet = await Web3WalletProvider.getWallet();
    await this.updateWalletConnectionState(wallet);

    Web3WalletProvider.registerWalletChangeListener(this.updateWalletConnectionState.bind(this));
    document.addEventListener('click', this.dismissClickHandler.bind(this));
  }

  async disconnectedCallback() {
    Web3WalletProvider.removeWalletChangeListener(this.updateWalletConnectionState.bind(this));
    document.removeEventListener('click', this.dismissClickHandler.bind(this));
  }

  private dismissClickHandler(_e: Event) {
    this.dropdownOpened = false;
  }

  private async updateWalletConnectionState(wallet: WalletConnection) {
    if (!wallet) {
      this.walletInfo = null;
      return;
    }

    this.walletInfo = { ...wallet, ...getWalletInfo(wallet.providerType) };
  }

  private formatWalletAddress(address: string) {
    return address.substring(0, 4) + '...' + address.substring(address.length - 4);
  }

  render() {
    return (
      <div class="wallet-container">
        {this.walletInfo && (
          <div class="network-container">
            <img src="https://base.org/document/favicon-32x32.png" width={24} height={24} />
            <p class="network-name">{formatName(CHAIN_MAP[CHAIN_ID])}</p>
          </div>
        )}

        <div class="btn-container" onClick={e => e.stopPropagation()}>
          <button
            class={'btn ' + (this.walletInfo ? 'btn-connected' : 'btn-connect')}
            onClick={() => {
              if (this.walletInfo) {
                // await Web3WalletProvider.disconnectWallet();
                this.dropdownOpened = !this.dropdownOpened;
              } else {
                Web3WalletProvider.getWallet(true);
              }
            }}
          >
            {this.walletInfo ? (
              <div class="wallet-info">
                <div class="status-dot"></div>
                <div title={this.walletInfo.providerType + ': ' + this.walletInfo.address}>{this.formatWalletAddress(this.walletInfo.address)}</div>
                <div class="chevron"></div>
              </div>
            ) : (
              'Connect Wallet'
            )}
          </button>
          {this.dropdownOpened ? (
            <div class="btn-dropdown">
              <button
                onClick={async () => {
                  this.dropdownOpened = false;
                  await navigator.clipboard.writeText(this.walletInfo.address);
                }}
              >
                Copy address
              </button>
              <button
                onClick={() => {
                  this.dropdownOpened = false;
                  Web3WalletProvider.disconnectWallet();
                }}
              >
                Disconnect
              </button>
              <button
                onClick={() => {
                  this.dropdownOpened = false;
                  Web3WalletProvider.switchWallet();
                }}
              >
                Switch
              </button>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

function formatName(name: string) {
  const parts = name.split('-');
  return parts.map(capitalizeFirstLetter).join(' ');
}

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
