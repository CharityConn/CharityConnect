<script lang="ts">
	export let show: boolean;
</script>

{#if show}
	<div class="flex flex-col items-center">
		<img src="https://d31vrfdo6b6g17.cloudfront.net/assets/images/loading-icon.gif" alt="Icon" class="w-16 h-16 mt-12">
		<h3 class="text-xl font-semibold mt-4">Ongoing transaction</h3>
		<p class="text text-gray-600 mt-3 mx-6 text-center">You need to approve this transaction in your wallet</p>
	</div>
{/if}
