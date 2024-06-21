<script lang="ts">
	import context from '../lib/context';
	import {apiAdapter} from '../lib/apiAdapter';
	import Loader from '../components/Loader.svelte';

	let tokenId: string;
	let walletAddress: string;
	let successMessage = '';
	let loading = true;
  
	let googleLink = '';
  let appleLink = '';
  let creatingGooglePass = false;
  let creatingApplePass = false;

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token)
		const token = value.token as {ownerAddress: string, tokenId: string};;
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;
		// You can load other data before hiding the loader

		await fetchWalletPassLinks();
		loading = false;
	});

	async function fetchWalletPassLinks(target?: 'google' | 'apple', retry = 0) {
    try {
      const res = await apiAdapter.getWalletPasses(tokenId);
      googleLink = res.google;
      appleLink = res.apple;

      if (target) {
        if (target === 'google' && googleLink) {
          creatingGooglePass = false;
          return;
        }

        if (target === 'apple' && appleLink) {
          creatingApplePass = false;
          return;
        }

        if (retry > 0) {
          setTimeout(() => fetchWalletPassLinks(target, retry - 1), 5000);
        }
      }
    } catch {
      if (retry > 0) {
        setTimeout(() => fetchWalletPassLinks(target, retry - 1), 5000);
      }
    }
  }

  async function generateGoogleWalletPass() {
    try {
      creatingGooglePass = true;
      await apiAdapter.generateWalletPass('google', tokenId);
      setTimeout(() => fetchWalletPassLinks('google', 5), 5000);
    } catch (e: any) {
			console.log(e, 'Failed to generate Google Wallet Pass')
			successMessage = 'Failed to generate Google Wallet Pass'
    }
  }

  function installGoogleWalletPass() {
    window.open(googleLink, '_blank');
  }

  async function generateAppleWalletPass() {
    try {
      creatingApplePass = true;
      await apiAdapter.generateWalletPass('apple', tokenId);
      setTimeout(() => fetchWalletPassLinks('apple', 5), 5000);
    } catch (e: any) {
			console.log(e, 'Failed to generate Apple Wallet Pass')
			successMessage = 'Failed to generate Apple Wallet Pass'
    }
  }

  function installAppleWalletPass() {
    window.open(appleLink, '_blank');
  }
</script>

<style>
.btn {
	display: flex;
	align-items: center;
	gap: 6px;
	border-radius: 10px;
	height: 36px;
	min-width: 112px;
	background: #EEEEEE;
	color: #0B0B0B;
	border: none;
	cursor: pointer;
}

.btn-primary {
	color: #fff;
	background: linear-gradient(234.79deg, #001AFF 37.73%, #4F95FF 118.69%), #8A9CB8;
}

.btn-primary:hover {
	background: linear-gradient(214.82deg, #001AFF -21.14%, #4F95FF 89.22%);
}

.btn-primary:disabled {
	background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), linear-gradient(234.79deg, #001AFF 37.73%, #4F95FF 118.69%) !important;
}

/* TODO: Secondary button hover & disable states are not distinct enough */
.btn-secondary {
	border: 2px solid #001AFF;
	background: #fff;
	color: #001AFF;
}

.btn-secondary:hover {
	border-color: #4F95FF;
	color: #4F95FF !important;
}

.btn-secondary:disabled {
	border-color: #4F95FF !important;
	color: #4F95FF !important;
	pointer-events: auto !important;
}

.section-gap {
	margin-top: 20px
}

.wallet-pass {
	display: flex;
	gap: 20px;
}

.error-message {
	color: red;
}
</style>

<div>
	{#if walletAddress && tokenId}
		<h3>Wallet Pass</h3>
		<p>
			Generate and install wallet pass on your phone, so that you can access your Pass easily.
		</p>

		<div class="wallet-pass section-gap">
			{#if googleLink} 
				<button class="btn btn-primary" on:click={installGoogleWalletPass}>
					Install Google Wallet Pass
				</button>
			{:else}
				<div>
					<button class="btn btn-secondary" disabled={creatingGooglePass} on:click={generateGoogleWalletPass}>
						Generate Google Wallet Pass
						<Loader show={creatingGooglePass} size="small" />
					</button>
				</div>
			{/if}

			{#if appleLink} 
				<button class="btn btn-primary" on:click={installAppleWalletPass}>
					Install Apple Wallet Pass
				</button>
			{:else}
				<div>
					<button class="btn btn-secondary" disabled={creatingApplePass} on:click={generateAppleWalletPass}>
						Generate Apple Wallet Pass
						<Loader show={creatingApplePass} size="small" />
					</button>
				</div>
			{/if}
		</div>
		{#if successMessage.length > 0}
			<p class="error-message">{successMessage}</p>
		{/if}
	{/if}
	<Loader show={loading} />
</div>
