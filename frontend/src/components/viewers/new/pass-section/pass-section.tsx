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
  private isLoading: boolean = false;

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
        this.isLoading = true;
        const provider = this.walletConnection.provider;
        const ccPassContract = new ethers.Contract(PASS_CONTRACT, CC_PASS_ABI, provider);

        this.tokenId = String(await ccPassContract.tokenOfOwnerByIndex(this.walletConnection.address, 0));
        this.isLoading = false;
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
    if (!this.walletConnection) {
      return (
        <div class="action-section">
          <img class="title-icon" alt="wallet icon" src="assets/images/wallet-icon.png" />
          <p class="desc">Connect your crypto wallet to continue</p>
          <wallet-button></wallet-button>
          <img class="sl-coinbase" alt="smart layer & coinbase" src="assets/images/sl-coinbase.png" />
        </div>
      );
    }

    if (!this.tokenId || this.isLoading) {
      return (
        <div class="action-section">
          <img class="title-icon" alt="ticket icon" src="assets/images/ticket-icon.png" />
          <p class="desc">Claim your free pass to continue</p>
          <button class="btn claim-btn" onClick={this.claim.bind(this)}>
            Claim Free Pass
          </button>
          <img class="sl-coinbase" alt="smart layer & coinbase" src="assets/images/sl-coinbase.png" />

          {this.isLoading && (
            <div class="loading-overlay">
              <img class="loading-icon" alt="loading" src="assets/images/loading-icon.png" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div class="">
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
