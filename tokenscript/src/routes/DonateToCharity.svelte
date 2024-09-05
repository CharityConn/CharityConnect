<script context="module" lang="ts">
	declare let tokenscript: any;
</script>

<script lang="ts">
	import context from '../lib/context';
	import { apiAdapter } from '../lib/apiAdapter';
	import Loader from '../components/Loader.svelte';
	import WaitApproveOrTransactionConfirmation from '../components/WaitApproveOrTransactionConfirmation.svelte';
	import Failed from '../components/Failed.svelte';
	import Succeeded from '../components/Succeeded.svelte';
	import type { ITransactionStatus } from '@tokenscript/card-sdk/dist/types';

	let tokenId: string;
	let amount: string = '';
	let walletAddress: string;
	let txnLink: string | undefined
	let loading = true;
	let state: 'initial' | 'pending sign or txn confirmation' | 'succeeded' | 'failed' = 'initial';

	let charityID: string = '';
	let charities: string[] = [];

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token);
		const token = value.token as { ownerAddress: string; tokenId: string; charityList: string[] };
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;
		//Convert object's "values" (like a dictionary's values) to an array. This works correctly even if it's already an array. We don't know why it's sometimes an array and sometimes an object.
		console.log('Charities: %o', Object.values(token.charityList));
		charities = Object.values(token.charityList);

		loading = false;
	});

	async function donate() {
		const amountFloat = parseFloat(amount);
		if (!charityID) {
			tokenscript.action.showMessageToast("error", "Can't Donate", "Select a Charity");
			return;
		}
		if (!amountFloat || amountFloat <= 0) {
			tokenscript.action.showMessageToast("error", "Can't Donate", "Enter an amount");
			return;
		}
		state = 'pending sign or txn confirmation';
		const args = { charity: charityID, amount: amountFloat * Math.pow(10, 18) };
		tokenscript.action.setProps(args);
		const listener = (foo: ITransactionStatus) => {
			if (foo.status === 'confirmed') {
				txnLink = foo.txLink
			}
		}
		const result = await tokenscript.action.executeTransaction(undefined, listener);
		if (result) {
			state = 'succeeded';
			const result = await apiAdapter.updateWalletPass(
				tokenId,
				amountFloat * Math.pow(10, 18),
				charityID
			);
			console.log('PUT wallet pass result: %o', result);
		} else {
			state = 'failed';
		}
	}

	function setWithDefaultAmount(amt: number) {
		amount = amt.toString();
	}

	function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
</script>

<div>
	<div class="flex flex-col items-center">
		{#if state === 'initial'}
			{#if walletAddress && tokenId}
				<h3 class="text-xl font-semibold mt-14">Donate to Charity</h3>
				<p class="text text-gray-600 mt-3">Choose a Charity and an amount to donate</p>
				<p class="text-sm text-gray-500 mt-6 w-full ml-6">Charity</p>
				<div class="w-full mt-1 px-3">
					<select id="charities" bind:value={charityID} class="rounded-lg border-2 border-gray-100 w-full bg-white h-14">
						<option value="" disabled>Select Charity</option>
						{#each charities as charity}
							<option value={charity}>{charity}</option>
						{/each}
					</select>
				</div>
				<p class="text-sm text-gray-500 mt-8 w-full ml-6">Amount</p>
				<div class="w-full mt-1 px-3">
					<div class="flex items-center rounded-lg border-2 border-gray-100">
						<input type="text" bind:value={amount} placeholder="0.00" class="w-full bg-white h-14 px-2 py-4 text-3xl"/>
						<svg width="36" height="36" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.9479 0.5L12.7842 1.04676V16.9125L12.9479 17.0731L20.4457 12.7199L12.9479 0.5Z" fill="#343434"/>
							<path d="M12.948 0.5L5.4502 12.7199L12.948 17.0732V9.3724V0.5Z" fill="#8C8C8C"/>
							<path d="M12.9478 18.4678L12.8555 18.5783V24.23L12.9478 24.4948L20.45 14.1167L12.9478 18.4678Z" fill="#3C3C3B"/>
							<path d="M12.948 24.4943V18.4673L5.4502 14.1162L12.948 24.4943Z" fill="#8C8C8C"/>
							<path d="M12.9482 17.0732L20.4459 12.72L12.9482 9.37256V17.0732Z" fill="#141414"/>
							<path d="M5.4502 12.72L12.9479 17.0732V9.37256L5.4502 12.72Z" fill="#393939"/>
						</svg>
						<span class="text-xl pl-1.5 pr-4">ETH</span>
					</div>
				</div>
				<div class="flex justify-between w-full px-3 mt-8">
					<!--hhh3 Get ETH balance-->
					<span class="text-sm text-gray-600">Suggested amounts</span><span class="text-sm text-indigo-500"><span>Balance: </span><span class="underline">0.002 ETH</span></span>
				</div>
				<div class="flex justify-evenly w-full mt-6">
					<button
						type="button"
						class="text-indigo-300 border-2 border-indigo-300 rounded-3xl px-5 py-2"
						on:click={() => setWithDefaultAmount(0.001)}>0.001</button
					>
					<button
						type="button"
						class="text-indigo-300 border-2 border-indigo-300 rounded-3xl px-5 py-2"
						on:click={() => setWithDefaultAmount(0.002)}>0.002</button
					>
					<button
						type="button"
						class="text-indigo-300 border-2 border-indigo-300 rounded-3xl px-5 py-2"
						on:click={() => setWithDefaultAmount(0.003)}>0.003</button
					>
					<button
						type="button"
						class="text-indigo-300 border-2 border-indigo-300 rounded-3xl px-5 py-2"
						on:click={() => setWithDefaultAmount(0.004)}>0.004</button
					>
				</div>
				<div class="w-full p-3 mt-5">
					<button type="button" on:click={() => donate()} class=" w-full py-4 bg-indigo-500 hover:bg-indigo-700 text-white rounded-xl text-xl">Review</button>
				</div>
			{/if}
		{:else if state === 'pending sign or txn confirmation'}
			<WaitApproveOrTransactionConfirmation show={state === 'pending sign or txn confirmation'} />
		{:else if state === 'succeeded'}
			{#if txnLink}
				<Succeeded amount={amount} transactionLink={txnLink} charity={charityID}/>
			{/if}
		{:else if state === 'failed'}
			<Failed retry={donate}/>
		{/if}
	</div>
	<Loader show={loading} />
</div>
