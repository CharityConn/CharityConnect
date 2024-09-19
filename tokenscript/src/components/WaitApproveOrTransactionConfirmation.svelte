<script lang="ts">
	import { frontendHost } from '../lib/constants';

	export let show: boolean;
</script>

{#if show}
	<div class="flex flex-col items-center justify-between min-h-screen">
		<div class="flex flex-col items-center">
			<img src={`${frontendHost}/assets/images/loading-icon.gif`} alt="Icon" class="w-16 h-16 mt-12">
			<h3 class="text-xl font-semibold mt-4">Ongoing transaction</h3>
			<p class="text text-ccGray mt-3 mx-6 text-center">You need to approve this transaction in your wallet</p>
		</div>
		<div class="mt-4 mb-10 mx-6 p-4 flex bg-ccPurple-light border border-ccPurple-dark rounded-lg">
			<svg class="w-8 h-6 mr-2" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M9.79639 2.375C13.5671 2.375 16.6245 5.43244 16.6245 9.20312C16.6245 12.9738 13.5671 16.0312 9.79639 16.0312C6.0257 16.0312 2.96826 12.9738 2.96826 9.20312C2.96826 5.43244 6.0257 2.375 9.79639 2.375Z" stroke="#6868FF" stroke-width="1.18812" stroke-miterlimit="10"/>
				<path d="M10.8354 8.16406H9.64795V12.4687" stroke="#6868FF" stroke-width="1.18812" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M11.2808 12.6172H8.01514" stroke="#6868FF" stroke-width="1.18812" stroke-miterlimit="10" stroke-linecap="round"/>
				<path d="M9.79639 4.82422C9.98721 4.82422 10.1738 4.88081 10.3324 4.98682C10.4911 5.09284 10.6148 5.24353 10.6878 5.41983C10.7608 5.59613 10.7799 5.79013 10.7427 5.97729C10.7055 6.16446 10.6136 6.33637 10.4786 6.47131C10.3437 6.60625 10.1718 6.69814 9.98462 6.73537C9.79746 6.7726 9.60346 6.75349 9.42716 6.68046C9.25085 6.60744 9.10017 6.48377 8.99415 6.3251C8.88813 6.16643 8.83154 5.97989 8.83154 5.78906C8.83154 5.53317 8.9332 5.28776 9.11414 5.10681C9.29508 4.92587 9.54049 4.82422 9.79639 4.82422Z" fill="#6868FF"/>
			</svg>
			<div>
				<p class="text text-ccGray">If you see the error message</p>
				<p class="text text-ccGray">“Transaction Error: Pop-up window failed to open…,”</p>
				<p class="text text-ccGray font-semibold">please enable pop-ups in your browser settings and try the transaction again.
				</p>
			</div>
		</div>
	</div>
{/if}
