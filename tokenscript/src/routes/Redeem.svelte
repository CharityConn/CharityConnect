<script context="module" lang="ts">
	import type { IWeb3LegacySDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: IWeb3LegacySDK;
</script>

<script lang="ts">
	import context from '../lib/context';
	import Loader from '../components/Loader.svelte';

	let loading = true;

	context.data.subscribe(async (value) => {
		if (!value.token) return;

		// You can load other data before hiding the loader
		loading = false;
	});
</script>

<div>
	<div class="flex flex-col items-center w-full px-6 mt-14">
		<svg width="57" height="56" viewBox="0 0 57 56" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="0.5" width="56" height="56" rx="28" fill="#C4C4FF" fill-opacity="0.5"/>
			<path d="M28.5 16C21.875 16 16.5 21.375 16.5 28C16.5 34.625 21.875 40 28.5 40C35.125 40 40.5 34.625 40.5 28C40.5 21.375 35.125 16 28.5 16Z" stroke="#6868FF" stroke-width="2" stroke-miterlimit="10"/>
			<path d="M28.5 20V29H34.5" stroke="#6868FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		<h3 class="text-xl font-semibold mt-6 text-ccBlack">Coming soon!</h3>
		<p class="text text-ccGray mt-3 text-center">Redeem will be available shortly!</p>
		<div class="w-full mt-5">
			<button type="button" on:click={tokenscript.action.closeCard} class="w-full py-4 bg-ccPurple-dark hover:bg-indigo-700 text-white rounded-xl text-xl">Ok</button>
		</div>
	</div>
	<Loader show={loading} />
</div>
