<script context="module" lang="ts">
	declare let tokenscript: any;
</script>

<script lang="ts">
	import context from '../lib/context';
	import { apiAdapter } from '../lib/apiAdapter';
	import Loader from '../components/Loader.svelte';
	import WaitApproveOrTransactionConfirmation from '../components/WaitApproveOrTransactionConfirmation.svelte';

	let tokenId: string;
	let amount: string = '';
	let walletAddress: string;
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
		console.log('xxx got charities2: %o', Object.values(token.charityList));
		charities = Object.values(token.charityList);

		loading = false;
	});

	async function donate() {
		const amountFloat = parseFloat(amount);
		if (!charityID) {
			console.log('xxx must enter charity');
			return;
		}
		console.log('xxx using amount: %o float: %o', amount, amountFloat);
		if (!amountFloat || amountFloat <= 0) {
			console.log('xxx must enter amount');
			return;
		}
		state = 'pending sign or txn confirmation';
		const args = { charity: charityID, amount: amountFloat * Math.pow(10, 18) };
		tokenscript.action.setProps(args);
		console.log('xxx post transaction with args: %o', args);
		const result = await tokenscript.action.executeTransaction();
		console.log('xxx donate1: %o', result);
		if (result) {
			//hhh3 successful
			state = 'succeeded';
			const result = await apiAdapter.updateWalletPass(
				tokenId,
				amountFloat * Math.pow(10, 18),
				charityID
			);
			console.log('xxx PUT result: %o', result);
		} else {
			//hhh3 failed
			state = 'failed';
		}
		console.log('xxx state: %s', state);
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
				<h3 class="text-lg font-semibold mb-2">Donate to Charity</h3>
				<p class="text-sm text-gray-600">Choose a Charity and an amount to donate</p>
				<p class="text-sm text-gray-500">Charity</p>
				<div>
					<select id="charities" bind:value={charityID} class="rounded-md border-2 border-gray-100 p-2">
						<option value="" disabled>Select Charity</option>
						{#each charities as charity}
							<option value={charity}>{charity}</option>
						{/each}
					</select>
				</div>
				<p class="text-sm text-gray-500">Amount</p>
				<input type="text" bind:value={amount} placeholder="0.00" class="rounded-md border-2 border-gray-100 p-2"/>
				<p class="text-sm text-gray-600">Suggested amounts</p>
				<div>
					<button
						type="button"
						class="text-purple-300 bg-purple-50 border-2 border-purple-300 rounded-2xl px-2 py-1"
						on:click={() => setWithDefaultAmount(0.001)}>0.001</button
					>
					<button
						type="button"
						class="text-purple-300 bg-purple-50 border-2 border-purple-300 rounded-2xl px-2 py-1"
						on:click={() => setWithDefaultAmount(0.002)}>0.002</button
					>
					<button
						type="button"
						class="text-purple-300 bg-purple-50 border-2 border-purple-300 rounded-2xl px-2 py-1"
						on:click={() => setWithDefaultAmount(0.003)}>0.003</button
					>
					<button
						type="button"
						class="text-purple-300 bg-purple-50 border-2 border-purple-300 rounded-2xl px-2 py-1"
						on:click={() => setWithDefaultAmount(0.004)}>0.004</button
					>
				</div>
				<div class="w-full p-2">
					<button
						type="button"
						on:click={() => donate()}
						class="w-full py-4 bg-blue-700 text-white rounded hover:bg-blue-800">Confirm</button
					>
				</div>
			{/if}
		{:else if state === 'pending sign or txn confirmation'}
			<WaitApproveOrTransactionConfirmation show={state === 'pending sign or txn confirmation'} />
		{:else if state === 'succeeded'}
			<h3>Feel Gud1</h3>
			<div>
				<span>You have donated {amount} ETH to:</span>
			</div>
			<div>
				<span>Save the Children</span>
			</div>
			<div>
				<span>View transaction</span>
			</div>
		{:else if state === 'failed'}
			<!--hhh3 implement failure handling-->
			FAILED
		{/if}
	</div>
	<Loader show={loading} />
</div>
