<script context="module" lang="ts">
	import type { ITokenScriptSDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: ITokenScriptSDK;
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
	import TransferERC20 from './routes/TransferERC20.svelte';
	import { createApiAdapter } from './lib/apiAdapter';

	let token;
	let initialised = false;
	createApiAdapter(tokenscript.env.BACKEND_HOST)

	//#trade is not in this map, but hardcoded in `routeChange()`
	const routingMap = {
		'#donateToCharity': DonateToCharity,
		'#quickDonate': QuickDonate,
		'#walletPass': WalletPass,
		'#vote': Vote,
		'#redeem': Redeem,
		'#transfer': TransferERC20,
	};

	let page;

	function routeChange() {
		if (document.location.hash == '#trade') {
			window.open('https://app.uniswap.org/swap?chain=base&exactField=output&outputCurrency=0xce8FEC9a10D4642368f124593098f2E4dD643652&inputCurrency=eth', '_blank');
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
