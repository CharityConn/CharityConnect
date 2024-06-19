<script lang="ts">
	import context from "../lib/context";
	import Loader from "../components/Loader.svelte";

    //TODO prod too
    //const checkinServerPrefix = "http://localhost:3206" //local dev
    const checkinServerPrefix = "https://d37i1m1hx1fc5p.cloudfront.net" //test node

	let token;
    let walletAddress;
	let merchantID = "";
	let successMessage = "";
	let loading = true;

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;
		token = value.token;
        walletAddress = value.token.ownerAddress;
		// You can load other data before hiding the loader
		loading = false;
	});

	async function checkin(){
        console.log("Checkin...");

		loading = true;

		try {
            const method = 'POST';
            const headers: any = {
                "Content-type": "application/json",
                "Accept": "application/json",
            };
            const userWallet = walletAddress;
            const res = await fetch(`${checkinServerPrefix}/user/${userWallet}/checkin`, {
                method,
                headers,
                body: JSON.stringify({ merchantID })
            });
            let data: any;
            data = await res.json();
            console.log(`Status code: ${res.status}`)
			successMessage = 'Done checkin';
		} catch (e){
			successMessage = 'Failed to checkin';
			console.error(e);
		}

		loading = false;
	}

</script>

<div>
	{#if token}
		<h3>Checkin</h3>
        <p>
        Select a store to check-in. Stay for more than 30 seconds to successfully check-in and receive 100 points.
        </p>

		<div id="message-title">
            Merchant ID:
        </div>
		<textarea class="message-input" bind:value={merchantID} placeholder="e.g 1234" disabled={loading}></textarea>

        {#if !successMessage.length}
            <div class="link-button" style="position: relative; margin: 0 auto; max-width: 200px;">
                <button type="button" on:click={() => checkin()} disabled={loading || !walletAddress.length || !merchantID.length || !!successMessage.length}>
                Checkin
                </button>
            </div>
        {:else}
            <p>{successMessage}</p>
        {/if}

	{/if}
	<Loader show={loading}/>
</div>
