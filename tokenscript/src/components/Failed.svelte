<script lang="ts">
	export let retry: () => void;
</script>

<div class="flex flex-col items-center w-full">
	<svg viewBox="0 0 57 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mt-14">
		<g clip-path="url(#clip0_34_1553)">
			<rect x="0.5" width="56" height="56" rx="28" fill="#FFB3B3" fill-opacity="0.5"/>
			<path d="M36.875 35.875L21.125 20.125M36.875 20.125L21.125 35.875" stroke="#FF6868" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
		</g>
		<defs>
			<clipPath id="clip0_34_1553">
				<rect x="0.5" width="56" height="56" rx="28" fill="white"/>
			</clipPath>
		</defs>
	</svg>
	<h3 class="text-xl font-semibold mt-4">Something went wrong</h3>
	<p class="text text-gray-600 mt-3 mx-6 text-center">Please, try again.</p>
	<div class="w-full p-3 mt-5">
		<button type="button" on:click={retry} class="w-full py-4 bg-ccPurple-dark hover:bg-indigo-700 text-white rounded-xl text-xl">Try Again</button>

	</div>
</div>
