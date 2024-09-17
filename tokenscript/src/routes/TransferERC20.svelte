<script context="module" lang="ts">
	import type { IWeb3LegacySDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: IWeb3LegacySDK;
</script>

<script lang="ts">
	import { ethers } from 'ethers';
	import context from '../lib/context';
	import Loader from '../components/Loader.svelte';
	import WaitApproveOrTransactionConfirmation from '../components/WaitApproveOrTransactionConfirmation.svelte';
	import Failed from '../components/Failed.svelte';
	import SucceededTransfer from '../components/SucceededTransfer.svelte';
	import type { ITransactionStatus } from '@tokenscript/card-sdk/dist/types';
	import ConfirmationTransfer from '../components/ConfirmationTransfer.svelte';
	import BigNumber from 'bignumber.js';

	let amount: string = '';
	let amountBigInt: bigint;
	let walletAddress: string;
	let recipientWalletAddress: string;
	let pointsBalance: string = '-';
	let txnLink: string | undefined;
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
		const token = value.token as { ownerAddress: string; points: string };
		walletAddress = token.ownerAddress;
		pointsBalance = String(
			new BigNumber(token.points).dividedBy(Math.pow(10, 18)).toFixed(4, 1)
		);
		loading = false;
	});

	//Return null if failed
	function validate(): { recipient: string; amount: bigint } | null {
		amountBigInt = ethers.parseUnits(amount, 18)
		if (!ethers.isAddress(recipientWalletAddress)) {
			tokenscript.action.showMessageToast('error', "Can't Transfer", 'Enter a recipient address');
			return null;
		}
		if (!amountBigInt || amountBigInt <= 0) {
			tokenscript.action.showMessageToast('error', "Can't Transfer", 'Enter an amount');
			return null;
		}
		return {
			recipient: recipientWalletAddress,
			amount: amountBigInt
		};
	}

	async function showConfirmation() {
		const validationResults = validate();
		if (!validationResults) {
			return;
		}
		state = 'pending confirmation';
	}

	async function transfer() {
		const args = validate();
		if (!args) {
			return;
		}
		state = 'pending sign or txn confirmation';
		tokenscript.action.setProps(args);
		const listener = (foo: ITransactionStatus) => {
			if (foo.status === 'confirmed') {
				txnLink = foo.txLink;
			}
		};
		const result = await tokenscript.action.executeTransaction(undefined, listener);
		if (result) {
			state = 'succeeded';
			console.log('PUT wallet pass result: %o', result);
		} else {
			state = 'failed';
		}
	}

	function cancelConfirmation() {
		state = 'initial';
	}
</script>

<div class="w-full">
	<div class="flex flex-col items-center w-full">
		{#if state === 'initial'}
			{#if walletAddress}
				<h3 class="text-xl font-semibold mt-14 text-ccBlack">Transfer</h3>
				<p class="text-sm text-ccGray mt-8 w-full ml-6">Amount</p>
				<div class="w-full mt-1 px-3">
					<div class="flex items-center rounded-md border border-ccGray-soft shadow-md">
						<input
							type="text"
							bind:value={amount}
							placeholder="0.00"
							class="w-full bg-transparent h-14 px-4 py-4 text-3xl text-ccBlack"
						/>
						<svg
							width="25"
							height="25"
							viewBox="0 0 25 25"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								x="0.950195"
								y="0.5"
								width="24"
								height="24"
								rx="12"
								fill="#C4C4FF"
								fill-opacity="0.5"
							/>
							<path
								d="M13.4952 13.9458C13.1638 14.1613 12.7367 14.1613 12.4053 13.9458L8.63719 11.4966C7.63456 10.8449 6.54071 12.1838 7.37927 13.0363L12.2373 17.9753C12.6291 18.3737 13.2714 18.3737 13.6632 17.9753L18.5212 13.0363C19.3598 12.1838 18.2659 10.8449 17.2633 11.4966L13.4952 13.9458Z"
								fill="#6868FF"
							/>
							<path
								d="M18.5433 8.48884C18.8269 8.94255 18.7031 9.53908 18.2624 9.8425L13.5174 13.1096C13.1759 13.3447 12.7247 13.3447 12.3831 13.1096L7.63808 9.8425C7.1974 9.53908 7.07361 8.94255 7.35718 8.48884L8.19235 7.15257C8.5305 6.61153 9.282 6.52124 9.73869 6.96679L12.2519 9.41873C12.6404 9.79769 13.2602 9.79769 13.6486 9.41873L16.1618 6.96679C16.6185 6.52124 17.37 6.61153 17.7082 7.15257L18.5433 8.48884Z"
								fill="#DC79FF"
							/>
						</svg>
						<span class="text-xl pl-1.5 pr-4">CHTY</span>
					</div>
				</div>

				<div class="flex w-full px-3 mt-8">
					<span class="text-sm text-ccGray">Your balance:&nbsp;</span><span
						class="text-sm text-ccPurple-dark underline">{pointsBalance} CHTY</span
					>
				</div>

				<p class="text-sm text-ccGray mt-8 w-full ml-6">Recipient address</p>
				<div class="w-full mt-1 px-3">
					<div class="flex items-center rounded-md border border-ccGray-soft shadow-md">
						<input
							type="text"
							bind:value={recipientWalletAddress}
							placeholder="0x3b…287"
							class="w-full bg-transparent h-14 px-4 py-4 text-3xl text-ccBlack bg-red-300"
						/>
					</div>
				</div>

				<div class="w-full p-3 mt-5">
					<button
						type="button"
						on:click={showConfirmation}
						class="w-full py-4 bg-ccPurple-dark hover:bg-gradient-hover active:bg-gradient-press text-white rounded-xl text-xl"
						>Review</button
					>
				</div>
			{/if}
		{:else if state === 'pending confirmation'}
			<ConfirmationTransfer
				confirm={transfer}
				close={cancelConfirmation}
				recipient={recipientWalletAddress}
				{amount}
			/>
		{:else if state === 'pending sign or txn confirmation'}
			<WaitApproveOrTransactionConfirmation show={state === 'pending sign or txn confirmation'} />
		{:else if state === 'succeeded'}
			{#if txnLink}
				<SucceededTransfer
					{amount}
					transactionLink={txnLink}
					recipient={recipientWalletAddress}
				/>
			{/if}
		{:else if state === 'failed'}
			<Failed retry={transfer} />
		{/if}
	</div>
	<Loader show={loading} />
</div>
