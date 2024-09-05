<script lang="ts">
	export let show: boolean;
</script>

{#if show}
	<h3>Ongoing transaction</h3>
	<p>You need to approve this transaction in your wallet</p>
{/if}
