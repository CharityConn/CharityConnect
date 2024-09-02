import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { CC_PASS_ABI, CHAIN_ID, isProd, PASS_CONTRACT, PAYMASTER_URL } from '../../../../integration/constants';
import { WalletConnection, Web3WalletProvider } from '../../../wallet/Web3WalletProvider';
import { ShowToastEventArgs } from '../../../app/app';
import { createWalletClient, custom, parseAbi } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { eip5792Actions } from 'viem/experimental';
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
    const smprovider = Web3WalletProvider.smartWalletSdk.makeWeb3Provider();

    try {
      const [account] = (await smprovider.request({ method: 'eth_requestAccounts' })) as any[];

      const walletClient = createWalletClient({
        chain: isProd ? base : baseSepolia,
        account,
        transport: custom(smprovider),
      }).extend(eip5792Actions());

      const id = await walletClient.sendCalls({
        account,
        calls: [
          {
            to: PASS_CONTRACT,
            abi: parseAbi(CC_PASS_ABI),
            functionName: 'claim',
          },
        ],
        capabilities: {
          paymasterService: {
            url: PAYMASTER_URL,
          },
        },
      });

      const checkClaimStatus = (id: string) => {
        setTimeout(async () => {
          // When it's pending status, it will not return receipts
          const {
            status,
            receipts: [receipt],
          } = await walletClient.getCallsStatus({
            id,
          });

          if (status === 'CONFIRMED') {
            this.showToast.emit({
              type: 'success',
              title: 'CharityConnect Pass claimed',
              description: (
                <span>
                  <a href={`https://sepolia.basescan.org/tx/${receipt.transactionHash}`} target="_blank">
                    {'View On Block Scanner'}
                  </a>
                </span>
              ),
            });
          } else {
            checkClaimStatus(id);
          }
        }, 5000);
      };

      checkClaimStatus(id);
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
            <img class="pass-cover" src="assets/icon/cc/charity-connect-card.png" />
            <div class="pass-no">
              No. <strong>{this.tokenId}</strong>
            </div>
          </div>
        </a>
      </div>
    );
  }
}
