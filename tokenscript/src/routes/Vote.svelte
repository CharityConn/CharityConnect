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
	{#if token}
		<h3>Vote for Charity Fund Allocation</h3>
		<p>
			Vote on how the charity funds should be allocated. Voting weight is based on your points
			(ERC-20 token holdings).
		</p>

		{#if points >= 0}
			{#if points >= 1}
				<p>
					You currently have {points} points.
				</p>
				<p>
					<button class="btn btn-primary" on:click={openVote}>Vote here</button>
				</p>
			{:else}
				<p>You don't have points yet. Checkin to get some.</p>
			{/if}
		{/if}
	{/if}
	<Loader show={loading} />
</div>
