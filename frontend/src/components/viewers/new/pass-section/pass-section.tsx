import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { CC_PASS_ABI, CHAIN_ID, PASS_CONTRACT } from '../../../../integration/constants';
import { WalletConnection, Web3WalletProvider } from '../../../wallet/Web3WalletProvider';
import { ShowToastEventArgs } from '../../../app/app';
import { ethers } from 'ethers';
import { apiAdapter } from '../../../../integration/apiAdapter';

@Component({
  tag: 'pass-section',
  styleUrl: 'pass-section.css',
  shadow: false,
  scoped: false,
})
export class PassSection {
  @State()
  private walletConnection: WalletConnection;

  @State()
  private tokenId: string;

  @State()
  private googleLink: string;

  @State()
  private appleLink: string;

  @State()
  private creatingGooglePass = false;

  @State()
  private creatingApplePass = false;

  @Event({
    eventName: 'showToast',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  showToast: EventEmitter<ShowToastEventArgs>;

  componentWillLoad() {
    Web3WalletProvider.registerWalletChangeListener(async (walletConnection?: WalletConnection) => {
      this.walletConnection = walletConnection;

      if (this.walletConnection) {
        const provider = this.walletConnection.provider;
        const ccPassContract = new ethers.Contract(PASS_CONTRACT, CC_PASS_ABI, provider);

        try {
          this.tokenId = String(await ccPassContract.tokenOfOwnerByIndex(this.walletConnection.address, 0));
          this.fetchWalletPassLinks();
        } catch {}
      }
    });
  }

  private async claim() {
    const provider = this.walletConnection.provider;
    const ccPassContract = new ethers.Contract(PASS_CONTRACT, CC_PASS_ABI, await provider.getSigner());

    try {
      const receipt = await ccPassContract.claim();
      this.showToast.emit({
        type: 'success',
        title: 'CharityConnect Pass claimed',
        description: (
          <span>
            <a href={`https://sepolia.basescan.org/tx/${receipt.hash}`} target="_blank">
              {'View On Block Scanner'}
            </a>
          </span>
        ),
      });
    } catch (e) {
      this.showToast.emit({
        type: 'error',
        title: 'Failed to claim',
        description: e.message,
      });
    }
  }

  private async fetchWalletPassLinks(target?: 'google' | 'apple', retry = 0) {
    try {
      const res = await apiAdapter.getWalletPasses(this.tokenId);
      this.googleLink = res.google;
      this.appleLink = res.apple;

      if (target) {
        if (target === 'google' && this.googleLink) {
          this.creatingGooglePass = false;
          return;
        }

        if (target === 'apple' && this.appleLink) {
          this.creatingApplePass = false;
          return;
        }

        if (retry > 0) {
          setTimeout(() => this.fetchWalletPassLinks(target, retry - 1), 5000);
        }
      }
    } catch {
      if (retry > 0) {
        setTimeout(() => this.fetchWalletPassLinks(target, retry - 1), 5000);
      }
    }
  }

  private async generateGoogleWalletPass() {
    try {
      this.creatingGooglePass = true;
      await apiAdapter.generateWalletPass('google', this.tokenId);
      setTimeout(() => this.fetchWalletPassLinks('google', 5), 5000);
    } catch (e: any) {
      this.showToast.emit({
        type: 'error',
        title: 'Failed to generate Google Wallet Pass',
        description: e.message,
      });
    }
  }

  private installGoogleWalletPass() {
    window.open(this.googleLink, '_blank');
  }

  private async generateAppleWalletPass() {
    try {
      this.creatingApplePass = true;
      await apiAdapter.generateWalletPass('apple', this.tokenId);
      setTimeout(() => this.fetchWalletPassLinks('apple', 5), 5000);
    } catch (e: any) {
      this.showToast.emit({
        type: 'error',
        title: 'Failed to generate Apple Wallet Pass',
        description: e.message,
      });
    }
  }

  private installAppleWalletPass() {
    window.open(this.appleLink, '_blank');
  }

  render() {
    if (!this.walletConnection) return null;
    if (!this.tokenId)
      return (
        <button class="btn btn-primary section-gap" onClick={this.claim.bind(this)}>
          Claim
        </button>
      );

    return (
      <div class="section-gap">
        <a class="pass-link" href={`/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}&tokenId=${this.tokenId}`}>
          <div class="pass">
            <div class="pass-title">CharityConnect Pass</div>
            <div class="pass-no">
              No. <strong>{this.tokenId}</strong>
            </div>
          </div>
        </a>
        <div class="wallet-pass section-gap">
          {this.googleLink ? (
            <button class="btn btn-primary" onClick={this.installGoogleWalletPass.bind(this)}>
              Install Google Wallet Pass
            </button>
          ) : (
            <div>
              <button class="btn btn-secondary" disabled={this.creatingGooglePass} onClick={this.generateGoogleWalletPass.bind(this)}>
                Generate Google Wallet Pass
                {this.creatingGooglePass && <loading-spinner color="#4F95FF" size="inline" />}
              </button>
            </div>
          )}

          {this.appleLink ? (
            <button class="btn btn-primary" onClick={this.installAppleWalletPass.bind(this)}>
              Install Apple Wallet Pass
            </button>
          ) : (
            <div>
              <button class="btn btn-secondary" disabled={this.creatingApplePass} onClick={this.generateAppleWalletPass.bind(this)}>
                Generate Apple Wallet Pass
                {this.creatingApplePass && <loading-spinner color="#4F95FF" size="inline" />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
