<script lang="ts">
	import context from '../lib/context';
	import { apiAdapter } from '../lib/apiAdapter';
	import Loader from '../components/Loader.svelte';
	import QRCode, { QRCodeToDataURLOptions } from 'qrcode';

	let tokenId: string;
	let walletAddress: string;
	let successMessage = '';
	let loading = true;

	let googleLink = '';
	let appleLink = '';
	let creatingGooglePass = false;
	let creatingApplePass = false;
	let qrCodeDataURL: string |null = null

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token);
		const token = value.token as { ownerAddress: string; tokenId: string };
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;
		// You can load other data before hiding the loader

		await fetchWalletPassLinks();
		const blockchainTokenURL = `https://sepolia.basescan.org/nft/0x40dc7D0B5E11Ee259314C548a238b9c909A4B721/${tokenId}`
		qrCodeDataURL = await QRCode.toDataURL(blockchainTokenURL, { width: 512, height: 512 } as QRCodeToDataURLOptions)
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
			<h3 class="text-xl font-semibold mt-14">Show as QR code</h3>
			<p class="text text-gray-600 mt-3">Scan to validate your contributions</p>
			<img src={qrCodeDataURL} alt="QR Code" class="w-64 h-64" />
			<p class="text text-gray-600 mt-3 mx-6 text-center">Generate and install wallet pass on your phone, so that you can access your Membership Card easily.</p>

			<div class="flex flex-col w-full mt-6 px-3">
				{#if googleLink}
					<button class="rounded-lg border-2 border-indigo-300 w-full h-14 text-xl flex items-center justify-evenly" on:click={installGoogleWalletPass}>
						<img src="https://d31vrfdo6b6g17.cloudfront.net/assets/images/google-wallet-pass.svg" alt="Google Wallet Pass"/>
						<span class="text-indigo-500">Install Google Wallet Pass</span>
					</button>
				{:else}
					<button class="rounded-lg border-2 border-indigo-300 w-full h-14 text-xl flex items-center justify-evenly" disabled="{creatingGooglePass}" on:click={generateGoogleWalletPass}>
						<img src="https://d31vrfdo6b6g17.cloudfront.net/assets/images/google-wallet-pass.svg" alt="Google Wallet Pass"/>
						<span class="text-indigo-500">Generate Google Wallet Pass</span>
						<Loader show={creatingGooglePass} size="small" />
					</button>
				{/if}

				{#if appleLink}
					<button class="rounded-lg border-2 border-indigo-300 w-full h-14 text-xl flex items-center justify-evenly mt-2" on:click={installAppleWalletPass}>
						<img src="https://d31vrfdo6b6g17.cloudfront.net/assets/images/apple-wallet-pass.svg" alt="Apple Wallet Pass"/>
						<span class="text-indigo-500">Install Apple Wallet Pass</span>
					</button>
				{:else}
					<button class="rounded-lg border-2 border-indigo-300 w-full h-14 text-xl flex items-center justify-evenly mt-2" disabled="{creatingApplePass}" on:click={generateAppleWalletPass}>
						<img src="https://d31vrfdo6b6g17.cloudfront.net/assets/images/apple-wallet-pass.svg" alt="Apple Wallet Pass"/>
						<span class="text-indigo-500">Generate Apple Wallet Pass</span>
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
