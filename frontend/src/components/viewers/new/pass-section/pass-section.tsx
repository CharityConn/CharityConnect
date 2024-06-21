import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { CC_PASS_ABI, CHAIN_ID, PASS_CONTRACT } from '../../../../integration/constants';
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

        this.tokenId = String(await ccPassContract.tokenOfOwnerByIndex(this.walletConnection.address, 0));
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
            <img class="pass-cover" src="assets/icon/cc/charity-connect-card.png" width="500" />
            <div class="pass-no">
              No. <strong>{this.tokenId}</strong>
            </div>
          </div>
        </a>
      </div>
    );
  }
}
