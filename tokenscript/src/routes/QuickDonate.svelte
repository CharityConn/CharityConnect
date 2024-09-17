<script context="module" lang="ts">
	import type { IWeb3LegacySDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: IWeb3LegacySDK;
</script>

<script lang="ts">
	import context from '../lib/context';
	import Loader from '../components/Loader.svelte';
	import { apiAdapter } from '../lib/apiAdapter';
	import WaitApproveOrTransactionConfirmation from '../components/WaitApproveOrTransactionConfirmation.svelte';
	import Failed from '../components/Failed.svelte';
	import Succeeded from '../components/SucceededDonate.svelte';
	import type { ITransactionStatus } from '@tokenscript/card-sdk/dist/types';
	import Confirmation from '../components/ConfirmationDonate.svelte';
	import { computeOperationalFee } from '../lib/donation';

	let tokenId: string;
	let walletAddress: string;
	let txnLink: string | undefined;
	//TODO use this amount for transaction. Don't hardcode in tokenscript.xml, though hardcoding in tokenscript.xml is safer, but duplicated
	const amountFloat = 0.001;
	const amount = String(amountFloat);
	const operationalFee = computeOperationalFee(amountFloat);
	let loading = true;
	let state:
		| 'initial'
		| 'pending confirmation'
		| 'pending sign or txn confirmation'
		| 'succeeded'
		| 'failed' = 'initial';

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token);
		const token = value.token as { ownerAddress: string; tokenId: string };
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;
		// You can load other data before hiding the loader

		loading = false;
	});

	async function showConfirmation() {
		state = 'pending confirmation';
	}

	async function donate() {
		state = 'pending sign or txn confirmation';
		const listener = (foo: ITransactionStatus) => {
			if (foo.status === 'confirmed') {
				txnLink = foo.txLink;
			}
		};
		const result = await tokenscript.action.executeTransaction(undefined, listener);
		if (result) {
			state = 'succeeded';
			const result = await apiAdapter.updateWalletPass(tokenId, 0.001 * Math.pow(10, 18));
			console.log('PUT wallet pass result: %o', result);
		} else {
			state = 'failed';
		}
	}

	function cancelConfirmation() {
		state = 'initial';
	}
</script>

<div>
	<div class="flex flex-col items-center">
		{#if state === 'initial'}
			{#if walletAddress && tokenId}
				<h3 class="text-xl font-semibold mt-14 text-ccBlack">Quick donate</h3>
				<p class="text text-ccGray mt-3">You are donating</p>
				<p class="text-2xl mt-4">0.001 ETH</p>
				<p class="text text-ccGray mt-4">to</p>
				<div
					class="flex items-center text text-ccPink-dark bg-ccPink-light border border-ccPink-border rounded-3xl px-6 py-1 mt-4"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 19"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M15.3437 11.2812L17.125 13.0625L15.3437 14.8438M15.3437 4.15625L17.125 5.9375L15.3437 7.71875M2.875 13.0625H6.03635C6.52505 13.0625 7.00619 12.9418 7.43707 12.7113C7.86795 12.4807 8.23524 12.1473 8.50635 11.7407L10 9.5"
							stroke="#DC79FF"
							stroke-width="1.18812"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M2.875 5.9375H6.03635C6.52505 5.93751 7.00619 6.05816 7.43707 6.28875C7.86795 6.51934 8.23524 6.85273 8.50635 7.25934L11.4937 11.7407C11.7648 12.1473 12.132 12.4807 12.5629 12.7113C12.9938 12.9418 13.475 13.0625 13.9637 13.0625H15.9375M15.9375 5.9375H13.9637C13.475 5.93751 12.9938 6.05816 12.5629 6.28875C12.132 6.51934 11.7648 6.85273 11.4937 7.25934L11.1875 7.71875"
							stroke="#DC79FF"
							stroke-width="1.18812"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>

					<p class="ml-2">Random Charity</p>
				</div>
				<div class="w-full p-2 mt-5">
					<button
						type="button"
						on:click={showConfirmation}
						class="w-full py-4 bg-ccPurple-dark hover:bg-gradient-hover active:bg-gradient-press text-white rounded-xl text-xl"
					>Review</button
					>
				</div>
			{/if}
		{:else if state === 'pending confirmation'}
			<Confirmation
				confirm={donate}
				close={cancelConfirmation}
				charityName="Random Charity"
				{amount}
				operationalFee={String(operationalFee)}
				totalAmount={String(amountFloat + operationalFee)}
			/>
		{:else if state === 'pending sign or txn confirmation'}
			<WaitApproveOrTransactionConfirmation show={state === 'pending sign or txn confirmation'} />
		{:else if state === 'succeeded'}
			{#if txnLink}
				<Succeeded amount="0.001" transactionLink={txnLink} charityName="Random Charity" />
			{/if}
		{:else if state === 'failed'}
			<Failed retry={donate} />
		{/if}
	</div>
	<Loader show={loading} />
</div>
