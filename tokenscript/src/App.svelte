<script context="module" lang="ts">
	import type { IWeb3LegacySDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: IWeb3LegacySDK;
</script>

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

	//#trade is not in this map, but hardcoded in `routeChange()`
	const routingMap = {
		'#donateToCharity': DonateToCharity,
		'#quickDonate': QuickDonate,
		'#walletPass': WalletPass,
		'#vote': Vote,
		'#redeem': Redeem,
	};

	let page;

	function routeChange() {
		if (document.location.hash == '#trade') {
			window.open('https://app.uniswap.org/swap?chain=arbitrum&exactField=output&outputCurrency=0x3a65C4cBd896c3681C471EBa8dA44828c8912043&inputCurrency=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', '_blank');
			tokenscript.action.closeCard()
			return
		}
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
