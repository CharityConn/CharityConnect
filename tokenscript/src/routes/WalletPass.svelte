<script lang="ts">
	import context from '../lib/context';
	import { apiAdapter } from '../lib/apiAdapter';
	import Loader from '../components/Loader.svelte';
	import { frontendHost, isProd, passContract } from '../lib/constants';
	import QRCode, { QRCodeToDataURLOptions } from 'qrcode';

	let tokenId: string;
	let walletAddress: string;
	let successMessage = '';
	let loading = true;

	let googleLink = '';
	let appleLink = '';
	let creatingGooglePass = false;
	let creatingApplePass = false;
	let qrCodeDataURL: string | null = null;

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token);
		const token = value.token as { ownerAddress: string; tokenId: string };
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;
		// You can load other data before hiding the loader

		await fetchWalletPassLinks();
		const blockchainTokenURL = isProd
			? `https://basescan.org/nft/${passContract.address}/${tokenId}`
			: `https://sepolia.basescan.org/nft/${passContract.address}/${tokenId}`;
		qrCodeDataURL = await QRCode.toDataURL(blockchainTokenURL, {
			width: 512,
			height: 512
		} as QRCodeToDataURLOptions);
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
			console.log(e, 'Failed to generate Google Wallet Pass');
			successMessage = 'Failed to generate Google Wallet Pass';
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
			console.log(e, 'Failed to generate Apple Wallet Pass');
			successMessage = 'Failed to generate Apple Wallet Pass';
		}
	}

	function installAppleWalletPass() {
		window.open(appleLink, '_blank');
	}
</script>

<div>
	<div class="flex flex-col items-center">
		{#if walletAddress && tokenId}
			<h3 class="text-xl font-semibold mt-14 text-ccBlack">Show as QR code</h3>
			<p class="text text-ccGray mt-3">Scan to validate your contributions</p>
			<img src={qrCodeDataURL} alt="QR Code" class="w-64 h-64" />
			<p class="text text-ccGray mt-3 mx-6 text-center">
				Generate and install wallet pass on your phone, so that you can access your Membership Card
				easily.
			</p>

			<div class="flex flex-col w-full mt-6 px-3">
				{#if googleLink}
					<button
						class="rounded-lg border border-ccPurple-dark w-full h-14 text-xl flex items-center justify-evenly hover:bg-ccPurple-dark text-ccPurple-dark hover:text-white"
						on:click={installGoogleWalletPass}
					>
						<img
							src={`${frontendHost}/assets/images/google-wallet-pass.svg`}
							alt="Google Wallet Pass"
							class="pl-1"
						/>
						<span>Install Google Wallet Pass</span>
					</button>
				{:else}
					<button
						class="rounded-lg border border-ccPurple-dark w-full h-14 text-xl flex items-center justify-evenly hover:bg-ccPurple-dark text-ccPurple-dark hover:text-white"
						disabled={creatingGooglePass}
						on:click={generateGoogleWalletPass}
					>
						<img
							src={`${frontendHost}/assets/images/google-wallet-pass.svg`}
							alt="Google Wallet Pass"
							class="pl-1"
						/>
						<span>Generate Google Wallet Pass</span>
						<Loader show={creatingGooglePass} size="small" />
					</button>
				{/if}

				{#if appleLink}
					<button
						class="rounded-lg border border-ccPurple-dark w-full h-14 text-xl flex items-center justify-evenly mt-2 hover:bg-ccPurple-dark text-ccPurple-dark hover:text-white"
						on:click={installAppleWalletPass}
					>
						<img
							src={`${frontendHost}/assets/images/apple-wallet-pass.svg`}
							alt="Apple Wallet Pass"
						/>
						<span>Install Apple Wallet Pass</span>
					</button>
				{:else}
					<button
						class="rounded-lg border border-ccPurple-dark w-full h-14 text-xl flex items-center justify-evenly mt-2 hover:bg-ccPurple-dark text-ccPurple-dark hover:text-white"
						disabled={creatingApplePass}
						on:click={generateAppleWalletPass}
					>
						<img
							src={`${frontendHost}/assets/images/apple-wallet-pass.svg`}
							alt="Apple Wallet Pass"
						/>
						<span>Generate Apple Wallet Pass</span>
						<Loader show={creatingApplePass} size="small" />
					</button>
				{/if}
			</div>
			{#if successMessage.length > 0}
				<p class="error-message">{successMessage}</p>
			{/if}
		{/if}
	</div>
	<Loader show={loading} />
</div>
