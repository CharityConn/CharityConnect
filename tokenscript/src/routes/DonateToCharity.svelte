<script context="module" lang="ts">
	import type { IWeb3LegacySDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: IWeb3LegacySDK;
</script>

<script lang="ts">
	import context from '../lib/context';
	import { apiAdapter } from '../lib/apiAdapter';
	import Loader from '../components/Loader.svelte';
	import WaitApproveOrTransactionConfirmation from '../components/WaitApproveOrTransactionConfirmation.svelte';
	import Failed from '../components/Failed.svelte';
	import Succeeded from '../components/Succeeded.svelte';
	import type { ITransactionStatus } from '@tokenscript/card-sdk/dist/types';
	import Confirmation from '../components/Confirmation.svelte';
	import { computeOperationalFee } from '../lib/donation';
	import { isProd } from '../lib/constants';
	import BigNumber from 'bignumber.js';
	import { backendHost } from '../lib/constants';

	let tokenId: string;
	let amount: string = '';
	let amountFloat: number;
	let operationalFee: number;
	let walletAddress: string;
	let nativeBalance: string = '-';
	let txnLink: string | undefined;
	let loading = true;
	let isCharityListExpanded = false;
	let state:
		| 'initial'
		| 'pending confirmation'
		| 'pending sign or txn confirmation'
		| 'succeeded'
		| 'failed' = 'initial';

	let selectedCharity: { name: string; icon: string } | null = null;
	let charities: { name: string; icon: string }[] = [];

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		console.log(value.token);
		const token = value.token as { ownerAddress: string; tokenId: string; charityList: string[] };
		walletAddress = token.ownerAddress;
		tokenId = token.tokenId;

		const chain = isProd ? 'base' : 'base-sepolia';
		const host = 'https://api.token-discovery.tokenscript.org';
		//const host = 'http://localhost:3001';
		const url = `${host}/get-owner-native-balance?chain=${chain}&blockchain=evm&owner=${walletAddress}`;
		const response = await fetch(url);
		if (response.ok) {
			const result = await response.json();
			nativeBalance = String(
				new BigNumber(result.balance).dividedBy(Math.pow(10, 18)).toFixed(4, 1)
			);
		}

		const charityListResponse = await fetch(`${backendHost}/charities`);
		if (charityListResponse.ok) {
			charities = await charityListResponse.json();
		}

		loading = false;
	});

	//Return null if failed
	function validate(): { charity: string; amount: number } | null {
		amountFloat = parseFloat(amount);
		if (!selectedCharity) {
			tokenscript.action.showMessageToast('error', "Can't Donate", 'Select a Charity');
			return null;
		}
		if (!amountFloat || amountFloat <= 0) {
			tokenscript.action.showMessageToast('error', "Can't Donate", 'Enter an amount');
			return null;
		}
		operationalFee = computeOperationalFee(amountFloat);
		return { charity: selectedCharity.name, amount: amountFloat };
	}

	async function showConfirmation() {
		const validationResults = validate();
		if (!validationResults) {
			return;
		}
		state = 'pending confirmation';
	}

	async function donate() {
		if (!selectedCharity) {
			return;
		}
		state = 'pending sign or txn confirmation';
		const args = {
			charity: selectedCharity.name,
			amount: (amountFloat + operationalFee) * Math.pow(10, 18)
		};
		tokenscript.action.setProps(args);
		const listener = (foo: ITransactionStatus) => {
			if (foo.status === 'confirmed') {
				txnLink = foo.txLink;
			}
		};
		const result = await tokenscript.action.executeTransaction(undefined, listener);
		if (result) {
			state = 'succeeded';
			const result = await apiAdapter.updateWalletPass(
				tokenId,
				amountFloat * Math.pow(10, 18),
				selectedCharity.name
			);
			console.log('PUT wallet pass result: %o', result);
		} else {
			state = 'failed';
		}
	}

	function setWithDefaultAmount(amt: number) {
		amount = amt.toString();
	}

	function cancelConfirmation() {
		state = 'initial';
	}

	function selectCharity(charity: { name: string; icon: string }) {
		selectedCharity = charity;
		isCharityListExpanded = false;
	}
</script>

<div class="w-full">
	<div class="flex flex-col items-center w-full">
		{#if state === 'initial'}
			{#if walletAddress && tokenId}
				<h3 class="text-xl font-semibold mt-14">Donate to Charity</h3>
				<p class="text text-gray-600 mt-3">Choose a Charity and an amount to donate</p>
				<p class="text-sm text-gray-500 mt-6 w-full ml-6">Charity</p>
				<div class="w-full mt-1 px-3">
					<div class="relative">
						<button
							class="w-full h-14 border py-2 px-4 rounded-md flex items-center justify-between"
							on:click={() => (isCharityListExpanded = !isCharityListExpanded)}
						>
							{#if selectedCharity}
								<img src={selectedCharity.icon} alt={selectedCharity.name} class="w-6 h-6 mr-2" />
								<span class="flex-grow text-left">{selectedCharity.name}</span>
							{:else}
								<span class="flex-grow text-left">Select Charity</span>
							{/if}
							{#if isCharityListExpanded}
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M15.625 12.8125L10 7.1875L4.375 12.8125"
										stroke="#707070"
										stroke-width="1.875"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{:else}
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4.375 7.1875L10 12.8125L15.625 7.1875"
										stroke="#8E8E8E"
										stroke-width="1.875"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{/if}
						</button>
						{#if isCharityListExpanded}
							<ul
								class="absolute w-full mt-2 px-2 border shadow-md rounded-md z-10 bg-white max-h-60 overflow-y-auto"
							>
								{#each charities as option}
									<button
										class="w-full h-11 py-2 cursor-pointer"
										on:click={() => selectCharity(option)}
									>
										<span class="w-full px-2 py-2 flex items-center rounded-lg hover:bg-indigo-100">
											<img src={option.icon} alt={option.name} class="w-6 h-6" />
											<span class="flex-grow text-left ml-2">{option.name}</span>
											{#if option.name === selectedCharity?.name}
												<svg
													width="19"
													height="20"
													viewBox="0 0 19 20"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M15.4375 5.25L7.125 14.75L3.5625 11.1875"
														stroke="#6868FF"
														stroke-width="1.1875"
														stroke-linecap="round"
														stroke-linejoin="round"
													/>
												</svg>
											{/if}
										</span>
									</button>
								{/each}
							</ul>
						{/if}
					</div>
				</div>
				<p class="text-sm text-gray-500 mt-8 w-full ml-6">Amount</p>
				<div class="w-full mt-1 px-3">
					<div class="flex items-center rounded-lg border-2 border-gray-100">
						<input
							type="text"
							bind:value={amount}
							placeholder="0.00"
							class="w-full bg-white h-14 px-2 py-4 text-3xl"
						/>
						<svg
							width="36"
							height="36"
							viewBox="0 0 25 25"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12.9479 0.5L12.7842 1.04676V16.9125L12.9479 17.0731L20.4457 12.7199L12.9479 0.5Z"
								fill="#343434"
							/>
							<path d="M12.948 0.5L5.4502 12.7199L12.948 17.0732V9.3724V0.5Z" fill="#8C8C8C" />
							<path
								d="M12.9478 18.4678L12.8555 18.5783V24.23L12.9478 24.4948L20.45 14.1167L12.9478 18.4678Z"
								fill="#3C3C3B"
							/>
							<path d="M12.948 24.4943V18.4673L5.4502 14.1162L12.948 24.4943Z" fill="#8C8C8C" />
							<path d="M12.9482 17.0732L20.4459 12.72L12.9482 9.37256V17.0732Z" fill="#141414" />
							<path d="M5.4502 12.72L12.9479 17.0732V9.37256L5.4502 12.72Z" fill="#393939" />
						</svg>
						<span class="text-xl pl-1.5 pr-4">ETH</span>
					</div>
				</div>
				<div class="flex justify-between w-full px-3 mt-8">
					<span class="text-sm text-gray-600">Suggested amounts</span><span
						class="text-sm text-indigo-500"
						><span>Balance: </span><span class="underline">{nativeBalance} ETH</span></span
					>
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
					<button
						type="button"
						on:click={showConfirmation}
						class=" w-full py-4 bg-indigo-500 hover:bg-indigo-700 text-white rounded-xl text-xl"
						>Review</button
					>
				</div>
			{/if}
		{:else if state === 'pending confirmation' && selectedCharity}
			<Confirmation
				confirm={donate}
				close={cancelConfirmation}
				charityName={selectedCharity.name}
				charityIcon={selectedCharity.icon}
				{amount}
				operationalFee={String(operationalFee)}
				totalAmount={String(amountFloat + operationalFee)}
			/>
		{:else if state === 'pending sign or txn confirmation'}
			<WaitApproveOrTransactionConfirmation show={state === 'pending sign or txn confirmation'} />
		{:else if state === 'succeeded'}
			{#if txnLink}
				<Succeeded
					{amount}
					transactionLink={txnLink}
					charityName={selectedCharity?.name ?? ''}
					charityIcon={selectedCharity?.icon}
				/>
			{/if}
		{:else if state === 'failed'}
			<Failed retry={donate} />
		{/if}
	</div>
	<Loader show={loading} />
</div>
