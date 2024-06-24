<script lang="ts">
	import context from '../lib/context';
	import Loader from '../components/Loader.svelte';

	//TODO prod too
	//const checkinServerPrefix = 'http://localhost:3206'; //local dev
	const checkinServerPrefix = 'https://d37i1m1hx1fc5p.cloudfront.net'; //test node

	let token;
	let walletAddress;
	let merchantID: number | null = null;
	let successMessage = '';
	let loading = true;
	let hasCheckedIn = false;
	let points = -1;
	const stores = [
		{ id: 1, name: 'Grocery Store 1' },
		{ id: 2, name: 'Candy Store 2' },
		{ id: 3, name: 'Perfume Store 3' }
	];

	context.data.subscribe(async (value) => {
		if (!value.token) return;
		token = value.token;
		walletAddress = value.token.ownerAddress;
		points = value.token.points;

		// You can load other data before hiding the loader
		loading = false;
	});

	async function checkin() {
		if (!canCheckin(loading, walletAddress, merchantID, hasCheckedIn)) {
			return;
		}
		console.log('Checkin...');

		successMessage = '';
		loading = true;

		try {
			const method = 'POST';
			const headers: any = {
				'Content-type': 'application/json',
				Accept: 'application/json'
			};
			const userWallet = walletAddress;
			const res = await fetch(`${checkinServerPrefix}/user/${userWallet}/checkin`, {
				method,
				headers,
				body: JSON.stringify({ merchantID: String(merchantID), passId: token.tokenId })
			});
			let data: any;
			data = await res.json();
			console.log(`Status code: ${res.status}`);
			successMessage = 'Done checkin';
			hasCheckedIn = true;
		} catch (e) {
			successMessage = 'Failed to checkin';
			console.error(e);
		}

		loading = false;
	}

	//Explicit args because Svelte reactive dependencies
	function canCheckin(loading, walletAddress, merchantID, hasCheckedIn) {
		if (loading || !walletAddress.length || !merchantID) {
			return false;
		}
		if (hasCheckedIn) {
			return false;
		}

		return true;
	}

	$: isCheckinDisabled = !canCheckin(loading, walletAddress, merchantID, hasCheckedIn);
</script>

<div>
	{#if token}
		<h3>Checkin</h3>
		<p>
			Select a store to check-in. Stay for more than 30 seconds to successfully check-in and receive
			1 point.
		</p>
		{#if points >= 0}
			<p>
				You currently have {points} points.
			</p>
		{/if}

		<div id="message-title">Check in to merchant:</div>
		<p>
			<select id="stores" bind:value={merchantID}>
				{#each stores as store}
					<option value={store.id}>{store.name}</option>
				{/each}
			</select>
		</p>

		{#if !hasCheckedIn}
			<button
				type="button"
				on:click={() => checkin()}
				disabled={isCheckinDisabled}
				class="btn btn-primary"
			>
				Checkin
			</button>
		{/if}

		{#if successMessage.length > 0}
			<p>{successMessage}</p>
		{/if}
	{/if}
	<Loader show={loading} />
</div>
