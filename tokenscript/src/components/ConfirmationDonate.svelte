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
		<div class="mt-4 mx-6">
			<p class="text text-ccGray text-center">
				<svg class="inline-block mb-0.5" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M9.79639 2.375C13.5671 2.375 16.6245 5.43244 16.6245 9.20312C16.6245 12.9738 13.5671 16.0312 9.79639 16.0312C6.0257 16.0312 2.96826 12.9738 2.96826 9.20312C2.96826 5.43244 6.0257 2.375 9.79639 2.375Z" stroke="#6868FF" stroke-width="1.18812" stroke-miterlimit="10"/>
					<path d="M10.8354 8.16406H9.64795V12.4687" stroke="#6868FF" stroke-width="1.18812" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M11.2808 12.6172H8.01514" stroke="#6868FF" stroke-width="1.18812" stroke-miterlimit="10" stroke-linecap="round"/>
					<path d="M9.79639 4.82422C9.98721 4.82422 10.1738 4.88081 10.3324 4.98682C10.4911 5.09284 10.6148 5.24353 10.6878 5.41983C10.7608 5.59613 10.7799 5.79013 10.7427 5.97729C10.7055 6.16446 10.6136 6.33637 10.4786 6.47131C10.3437 6.60625 10.1718 6.69814 9.98462 6.73537C9.79746 6.7726 9.60346 6.75349 9.42716 6.68046C9.25085 6.60744 9.10017 6.48377 8.99415 6.3251C8.88813 6.16643 8.83154 5.97989 8.83154 5.78906C8.83154 5.53317 8.9332 5.28776 9.11414 5.10681C9.29508 4.92587 9.54049 4.82422 9.79639 4.82422Z" fill="#6868FF"/>
				</svg>
				Ensure that pop-ups are enabled in your browser settings.</p>
		</div>
	</div>
</div>
