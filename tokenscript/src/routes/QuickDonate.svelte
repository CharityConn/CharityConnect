<script context="module" lang="ts">
	declare let tokenscript: any;
</script>

<script lang="ts">
	import context from '../lib/context';
	import Loader from '../components/Loader.svelte';
	import { apiAdapter } from '../lib/apiAdapter';
	import WaitApproveOrTransactionConfirmation from '../components/WaitApproveOrTransactionConfirmation.svelte';

	let tokenId: string;
	let walletAddress: string;
	let loading = true;
	let state: 'initial' | 'pending sign or txn confirmation' | 'succeeded' | 'failed' = 'initial';

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token);
		const token = value.token as { ownerAddress: string; tokenId: string };
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;
		// You can load other data before hiding the loader

		loading = false;
	});

	async function donate() {
		state = 'pending sign or txn confirmation';
		console.log('xxx before executeTransaction');
		const result = await tokenscript.action.executeTransaction();
		console.log('xxx donate1: %o', result);
		if (result) {
			//hhh3 successful
			state = 'succeeded';
			const result = await apiAdapter.updateWalletPass(tokenId, 0.001 * Math.pow(10, 18));
			console.log('xxx PUT result: %o', result);
		} else {
			//hhh3 failed
			state = 'failed';
		}
	}

	function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
</script>

<div>
	<div class="flex flex-col items-center">
	{#if state === 'initial'}
		{#if walletAddress && tokenId}
			<h3 class="text-lg font-semibold mb-2">Quick donate</h3>
			<p class="text-sm text-gray-600">You are donating</p>
			<p class="text-xl font-semibold">
0.001 ETH
			</p>
			<p class="text-sm text-gray-600">
				to
			</p>
			<p class="text-lg font-semibold text-purple-300 bg-purple-50 border-2 border-purple-300 rounded-3xl p-2">
				Random Charity
			</p>
			<div class="w-full p-2">
				<button type="button" on:click={() => donate()} class="w-full py-4 bg-blue-700 text-white rounded hover:bg-blue-800">Confirm</button>
			</div>
		{/if}
	{:else if state === 'pending sign or txn confirmation'}
		<WaitApproveOrTransactionConfirmation show={state === 'pending sign or txn confirmation'} />
	{:else if state === 'succeeded'}
		<h3 class="text-lg font-semibold mb-2">Feel Gud1</h3>
		<div class="text-sm text-gray-600">
			<span>You have donated 0.001 ETH to:</span>
		</div>
		<div class="text-lg font-semibold text-green-500">
			<span>Save the Children</span>
		</div>
		<div class="text-sm text-blue-500 underline cursor-pointer">
			<span>View transaction</span>
		</div>
	{:else if state === 'failed'}
		<!--hhh3 implement failure handling-->
		<div class="text-red-500 font-semibold">FAILED</div>
	{/if}
</div>
	<Loader show={loading} />
</div>
