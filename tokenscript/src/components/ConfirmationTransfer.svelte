<script lang="ts">
	import { prettyFormatAddress } from '../lib/ethereum';

	export let close: () => void;
	export let confirm: () => void;
	export let recipient: string;
	export let amount: string;
</script>

<div class="w-full">
	<button on:click={close} class="flex mt-12 ml-4">
		<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clip-path="url(#clip0_192_2372)">
				<path
					d="M14.396 15.4779L10.1977 11.2704L14.396 7.06295L13.1035 5.77045L7.6035 11.2704L13.1035 16.7704L14.396 15.4779Z"
					fill="#2D2D2D"
				/>
			</g>
			<defs>
				<clipPath id="clip0_192_2372">
					<rect width="22" height="22" fill="white" />
				</clipPath>
			</defs>
		</svg>
		<span class="">Back</span>
	</button>

	<div class="flex flex-col items-center w-full px-3">
		<h3 class="text-xl font-semibold mt-5">Summary</h3>
		<p class="text text-ccGray mt-3">Review and confirm your transaction</p>
		<p class="text text-ccGray mt-5">Recipient</p>
		<div
			class="flex items-center text text-ccPink-dark bg-ccPink-light border border-ccPink-border rounded-3xl px-6 py-1 mt-4"
		>
			<svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M15.437 5.84375H3.56201C2.57825 5.84375 1.78076 6.64124 1.78076 7.625V14.75C1.78076 15.7338 2.57825 16.5312 3.56201 16.5312H15.437C16.4208 16.5312 17.2183 15.7338 17.2183 14.75V7.625C17.2183 6.64124 16.4208 5.84375 15.437 5.84375Z" stroke="#DC79FF" stroke-width="1.18812" stroke-linejoin="round"/>
				<path d="M15.2648 5.84376V4.73048C15.2647 4.45743 15.2044 4.18777 15.0881 3.94073C14.9718 3.69369 14.8024 3.47537 14.592 3.30133C14.3816 3.1273 14.1354 3.00185 13.8709 2.93393C13.6064 2.86601 13.3302 2.8573 13.062 2.90841L3.28889 4.57648C2.86448 4.65736 2.48159 4.88381 2.20628 5.21678C1.93096 5.54975 1.78047 5.96835 1.78076 6.4004V8.21876" stroke="#DC79FF" stroke-width="1.18812" stroke-linejoin="round"/>
				<path d="M13.6561 12.375C13.4213 12.375 13.1917 12.3054 12.9964 12.1749C12.8011 12.0444 12.6489 11.8589 12.559 11.6419C12.4691 11.425 12.4456 11.1862 12.4914 10.9558C12.5373 10.7255 12.6504 10.5139 12.8164 10.3478C12.9825 10.1817 13.1941 10.0686 13.4245 10.0228C13.6548 9.977 13.8936 10.0005 14.1106 10.0904C14.3276 10.1803 14.513 10.3325 14.6435 10.5278C14.774 10.723 14.8436 10.9526 14.8436 11.1875C14.8436 11.5024 14.7185 11.8045 14.4958 12.0272C14.2731 12.2499 13.9711 12.375 13.6561 12.375Z" fill="#DC79FF"/>
			</svg>
			<p class="ml-2">{prettyFormatAddress(recipient)}</p>
		</div>
		<p class="text text-ccGray mt-3">Amount</p>
		<p class="text-xl mt-1">{amount} CHTY</p>
		<div class="w-full p-2 mt-5">
			<button
				type="button"
				on:click={confirm}
				class="w-full py-4 bg-ccPurple-dark hover:bg-gradient-hover active:bg-gradient-press text-white rounded-xl text-xl"
				>Confirm</button
			>
		</div>
	</div>
</div>
