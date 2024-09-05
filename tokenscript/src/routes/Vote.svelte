<script lang="ts">
	import context from '../lib/context';
	import Loader from '../components/Loader.svelte';

	let token;
	let walletAddress;
	let loading = true;
	let points = -1;

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		token = value.token;
		walletAddress = value.token.ownerAddress;
		points = value.token.points;

		// You can load other data before hiding the loader
		loading = false;
	});

	function openVote() {
		window.open('https://testnet.snapshot.org/#/charityconnect.eth', '_blank');
	}
</script>

<div>
	<div class="flex flex-col items-center w-full px-6">
		{#if token}
			<h3 class="text-xl font-semibold mt-14">Vote for Charity Fund Allocation</h3>
			<p class="text text-gray-600 mt-3 text-center">Vote on how the charity funds should be allocated. Voting weight is based on your points (ERC-20 token holdings)</p>

			{#if points >= 0}
				{#if points >= 1}
					<p class="text text-gray-600 mt-3 text-center">You currently have {points / Math.pow(10, 18)} points.</p>
					<div class="w-full mt-5">
						<button type="button" on:click={openVote} class="w-full py-4 bg-indigo-500 hover:bg-indigo-700 text-white rounded-xl text-xl">Vote here</button>
					</div>
				{:else}
					<p class="text text-gray-600 mt-3 text-center">You don't have points yet. Donate to get some.</p>
				{/if}
			{/if}
		{/if}
	</div>
	<Loader show={loading} />
</div>
