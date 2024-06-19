import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { CC_PASS_ABI, PASS_CONTRACT } from '../../../../integration/constants';
import { WalletConnection, Web3WalletProvider } from '../../../wallet/Web3WalletProvider';
import { ShowToastEventArgs } from '../../../app/app';
import { ethers } from 'ethers';

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
  private tokenId: number;

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
          this.tokenId = await ccPassContract.tokenOfOwnerByIndex(this.walletConnection.address, 0);
        } catch {}
      }
    });
  }

  private async handleClaim() {
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

  render() {
    if (!this.walletConnection) return null;

    return (
      <div class="pass-section">
        {this.tokenId ? (
          <div class="pass">
            <div class="pass-title">CharityConnect Pass</div>
            <div class="pass-no">
              No. <strong>{this.tokenId}</strong>
            </div>
          </div>
        ) : (
          <button class="btn btn-primary" onClick={this.handleClaim.bind(this)}>
            Claim
          </button>
        )}
      </div>
    );
  }
}
