import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { CC_PASS_ABI, CHAIN_CONFIG, CHAIN_ID, isProd, PASS_CONTRACT, PAYMASTER_URL } from '../../../../integration/constants';
import { SupportedWalletProviders, WalletConnection, Web3WalletProvider } from '../../../wallet/Web3WalletProvider';
import { ShowToastEventArgs } from '../../../app/app';
import { createPublicClient, createWalletClient, custom, parseAbi } from 'viem';
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

  private async loadPass() {
    if (this.walletConnection) {
      this.isLoading = true;

      const provider = this.walletConnection.provider;
      const ccPassContract = new ethers.Contract(PASS_CONTRACT, CC_PASS_ABI, provider);
      try {
        this.tokenId = String(await ccPassContract.tokenOfOwnerByIndex(this.walletConnection.address, 0));
      } catch {}

      this.isLoading = false;
    }
  }

  componentWillLoad() {
    Web3WalletProvider.registerWalletChangeListener(async (walletConnection?: WalletConnection) => {
      this.walletConnection = walletConnection;
      this.tokenId = null;
      await this.loadPass();
    });
  }

  private async claim() {
    const connection = await Web3WalletProvider.getWallet(true);
    const account = connection.address as `0x${string}`;
    const provider = connection.eip1193Provider;

    try {
      this.isLoading = true;

      if (connection.providerType === SupportedWalletProviders.SmartWallet) {
        await this.claimWithPaymaster(account, provider);
      } else {
        await this.claimWithPayment(account, provider);
      }
    } catch (e) {
      this.isLoading = false
      this.showToast.emit({
        type: 'error',
        title: 'Failed to claim',
        description: e.message,
      });
    }
  }

  private async claimWithPaymaster(account: `0x${string}`, provider: any) {
    const walletClient = createWalletClient({
      chain: isProd ? base : baseSepolia,
      account,
      transport: custom(provider),
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
          await this.onClaimed(receipt.transactionHash);
        } else {
          checkClaimStatus(id);
        }
      }, 5000);
    };

    checkClaimStatus(id);
  }

  private async claimWithPayment(account: `0x${string}`, provider: any) {
    const walletClient = createWalletClient({
      chain: isProd ? base : baseSepolia,
      account,
      transport: custom(provider),
    });
    const publicClient = createPublicClient({
      chain: isProd ? base : baseSepolia,
      transport: custom(provider),
    });

    const { request } = await publicClient.simulateContract({
      account,
      chain: isProd ? base : baseSepolia,
      address: PASS_CONTRACT,
      abi: parseAbi(CC_PASS_ABI),
      functionName: 'claim',
    });
    const hash = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });

    await this.onClaimed(hash);
  }

  private async onClaimed(hash: string) {
    await this.loadPass();
    this.showToast.emit({
      type: 'success',
      title: 'CharityConnect Pass claimed',
      description: (
        <span>
          <a href={`${CHAIN_CONFIG[CHAIN_ID].explorer}${hash}`} target="_blank">
            {'View On Block Scanner'}
          </a>
        </span>
      ),
    });
  }

  render() {
    // Wallet not connected
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

    // Wallet connected, but no pass or loading pass in progress
    if (!this.tokenId || this.isLoading) {
      return (
        <div class="action-section">
          <img class="title-icon" alt="ticket icon" src="assets/images/ticket-icon.png" />
          <p class="desc">Claim your free pass to continue</p>
          <button class="btn action-btn" onClick={this.claim.bind(this)}>
            Claim Free Pass
          </button>
          <img class="sl-coinbase" alt="smart layer & coinbase" src="assets/images/sl-coinbase.png" />

          {this.isLoading && (
            <div class="loading-overlay">
              <img class="loading-icon" alt="loading" src="assets/images/loading-icon.gif" />
            </div>
          )}
        </div>
      );
    }

    // Pass view
    return (
      <div class="pass-section">
        <a class="pass-link" href={`/?chain=${CHAIN_ID}&contract=${PASS_CONTRACT}&tokenId=${this.tokenId}`}>
          <img class="pass" src="assets/images/charity-connect-card.png" />
        </a>
      </div>
    );
  }
}
