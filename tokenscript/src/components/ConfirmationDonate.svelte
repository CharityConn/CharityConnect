<script lang="ts">
	export let close: () => void;
	export let confirm: () => void;
	export let charityName: string;
	export let charityIcon: string | null = null;
	export let amount: string;
	export let operationalFee: string;
	export let totalAmount: string;
</script>

<div class="w-full">
	<button on:click={close} class="flex mt-12 ml-4">
		<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_192_2372)">
				<path
					d="M14.396 15.4779L10.1977 11.2704L14.396 7.06295L13.1035 5.77045L7.6035 11.2704L13.1035 16.7704L14.396 15.4779Z"
					fill="#2D2D2D"
				/>
			</g>
			<defs>
				<clipPath id="clip0_192_2372">
					<rect width="22" height="22" fill="white" />
				</clipPath>
			</defs>
		</svg>
		<span class="">Back</span>
	</button>

	<div class="flex flex-col items-center w-full px-3">
		<h3 class="text-xl font-semibold mt-5">Summary</h3>
		<p class="text text-ccGray mt-3">Review and confirm your transaction</p>
		<p class="text text-ccGray mt-5">Recipient</p>
		<div
			class="flex items-center text text-ccPink-dark bg-ccPink-light border border-ccPink-border rounded-3xl px-6 py-1 mt-4"
		>
			{#if charityIcon}
				<img src={charityIcon} alt="Charity Icon" class="w-6 h-6" />
			{:else}
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
			{/if}
			<p class="ml-2">{charityName}</p>
		</div>
		<p class="text text-ccGray mt-3">Donation amount</p>
		<p class="text-xl mt-1">{amount} ETH</p>
		<p class="text text-ccGray mt-4">Operational fee</p>
		<p class="text-xl mt-1">{operationalFee} ETH</p>
		<p class="text text-ccGray mt-4">Total amount</p>
		<p class="text-4xl mt-3">{totalAmount} ETH</p>
		<div class="w-full p-2 mt-5">
			<button
				type="button"
				on:click={confirm}
				class="w-full py-4 bg-ccPurple-dark hover:bg-gradient-hover active:bg-gradient-press text-white rounded-xl text-xl"
				>Confirm</button
			>
		</div>
	</div>
</div>
