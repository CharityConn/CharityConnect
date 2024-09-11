<script lang="ts">
	import './tailwind.css';
	import context from './lib/context';
	import NotFound from './routes/NotFound.svelte';
	import DonateToCharity from './routes/DonateToCharity.svelte';
	import QuickDonate from './routes/QuickDonate.svelte';
	import WalletPass from './routes/WalletPass.svelte';
	import Vote from './routes/Vote.svelte';
	import Redeem from './routes/Redeem.svelte';

	let token;
	let initialised = false;

	const routingMap = {
		'#donateToCharity': DonateToCharity,
		'#quickDonate': QuickDonate,
		'#walletPass': WalletPass,
		'#vote': Vote,
		'#redeem': Redeem,
	};

	let page;

	function routeChange() {
		page = routingMap[token.level == 0 ? '#adopt' : document.location.hash] || NotFound;
	}

	// @ts-ignore
	web3.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {
		if (initialised) return;

		context.setToken(updatedTokens.currentInstance);
		token = updatedTokens.currentInstance;

		initialised = true;

		routeChange();
	};
</script>

<svelte:window on:hashchange={routeChange} />

<div>
	<div id="token-container">
		<svelte:component this={page} />
	</div>
</div>
