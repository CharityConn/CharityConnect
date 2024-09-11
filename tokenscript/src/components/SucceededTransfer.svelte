<script context="module" lang="ts">
	import type { IWeb3LegacySDK } from '@tokenscript/card-sdk/dist/types';

	declare let tokenscript: IWeb3LegacySDK;
</script>

<script lang="ts">
	import { prettyFormatAddress } from '../lib/ethereum';

	export let amount: string;
	export let transactionLink: string;
	export let recipient: string;

	import { onMount } from 'svelte';

	onMount(() => {
		setTimeout(() => {
			svgClass = 'mt-6 w-40 h-24 transform transition-all duration-1000 scale-100';
		}, 0); // Immediate but in next event loop tick
	});

	let svgClass = 'mt-4 w-40 h-24 transform transition-all duration-1000 scale-50';
</script>

<div class="flex flex-col items-center w-full">
	<svg
		id="feelsGoodSvg"
		viewBox="0 0 169 102"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class={svgClass}
	>
		<path
			d="M161.16 43.8077C160.765 43.9363 160.331 43.8201 160.053 43.5112L156.893 39.9988C156.053 39.0641 154.578 40.1261 155.197 41.22L158.786 47.5573C159.076 48.0684 159.728 48.2432 160.234 47.9453L166.512 44.2517C167.595 43.6141 166.849 41.9569 165.653 42.3459L161.16 43.8077Z"
			fill="#6868FF"
		/>
		<path
			d="M167.771 39.6399C167.936 40.1778 167.648 40.7499 167.118 40.9381L161.41 42.9646C160.999 43.1105 160.541 42.9877 160.258 42.656L156.329 38.0472C155.964 37.6192 156.001 36.9798 156.412 36.5962L157.624 35.4665C158.114 35.0091 158.902 35.1219 159.244 35.6986L161.129 38.8723C161.421 39.3628 162.05 39.5315 162.548 39.2523L165.767 37.4463C166.352 37.1181 167.091 37.4143 167.287 38.0557L167.771 39.6399Z"
			fill="#DC79FF"
		/>
		<path
			d="M10.1327 42.7191C9.94422 43.0894 9.55529 43.314 9.14033 43.2921L4.42227 43.0428C3.16686 42.9765 2.87474 44.7705 4.08633 45.1059L11.1055 47.049C11.6716 47.2057 12.2564 46.8681 12.4037 46.2995L14.2305 39.2491C14.5458 38.0322 12.8462 37.3882 12.2759 38.5085L10.1327 42.7191Z"
			fill="#6868FF"
		/>
		<path
			d="M11.8603 35.0973C12.3569 35.3613 12.5578 35.9695 12.3161 36.4774L9.71329 41.9461C9.52596 42.3397 9.11517 42.5769 8.68065 42.5423L2.64317 42.062C2.08246 42.0174 1.65619 41.5394 1.67587 40.9772L1.73384 39.3216C1.75732 38.6513 2.39405 38.1741 3.04405 38.3396L6.62108 39.2509C7.17393 39.3918 7.73821 39.066 7.89266 38.5168L8.89198 34.9633C9.07357 34.3176 9.80523 34.0048 10.3975 34.3197L11.8603 35.0973Z"
			fill="#DC79FF"
		/>
		<circle cx="143.755" cy="5.64866" r="2.75676" fill="#DC79FF" fill-opacity="0.5" />
		<circle cx="29.3495" cy="75.946" r="2.75676" fill="#DC79FF" fill-opacity="0.5" />
		<circle cx="29.3491" cy="23.5676" r="1.37838" fill="#DC79FF" fill-opacity="0.5" />
		<rect x="35.9888" width="102" height="102" rx="51" fill="#C4C4FF" fill-opacity="0.5" />
		<path
			d="M89.8993 57.8812C88.4385 58.8307 86.5554 58.8307 85.0946 57.8812L68.4846 47.0847C64.0649 44.2119 59.2431 50.1138 62.9395 53.8718L84.3543 75.6435C86.0815 77.3994 88.9124 77.3994 90.6396 75.6435L112.054 53.8718C115.751 50.1138 110.929 44.2119 106.509 47.0847L89.8993 57.8812Z"
			fill="#6868FF"
		/>
		<path
			d="M112.151 33.8263C113.401 35.8263 112.856 38.4558 110.913 39.7933L89.9965 54.195C88.4911 55.2315 86.5022 55.2315 84.9968 54.195L64.0801 39.7933C62.1375 38.4558 61.5919 35.8263 62.8419 33.8263L66.5234 27.9359C68.014 25.5509 71.3266 25.1529 73.3398 27.1169L84.4184 37.9253C86.1306 39.5958 88.8627 39.5958 90.575 37.9253L101.654 27.1169C103.667 25.1529 106.979 25.5509 108.47 27.9359L112.151 33.8263Z"
			fill="#DC79FF"
		/>
	</svg>

	<h3 class="text-xl font-semibold mt-4">CHTY Transferred</h3>
	<p class="text text-ccGray mt-3 mx-6 text-center">You have sent {amount} CHTY to:</p>

	<div
		class="flex items-center text text-ccPink-dark bg-ccPink-light border border-ccPink-border rounded-3xl px-6 py-1 mt-4"
	>
		<svg
			width="25"
			height="25"
			viewBox="0 0 25 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="0.950195"
				y="0.5"
				width="24"
				height="24"
				rx="12"
				fill="#C4C4FF"
				fill-opacity="0.5"
			/>
			<path
				d="M13.4952 13.9458C13.1638 14.1613 12.7367 14.1613 12.4053 13.9458L8.63719 11.4966C7.63456 10.8449 6.54071 12.1838 7.37927 13.0363L12.2373 17.9753C12.6291 18.3737 13.2714 18.3737 13.6632 17.9753L18.5212 13.0363C19.3598 12.1838 18.2659 10.8449 17.2633 11.4966L13.4952 13.9458Z"
				fill="#6868FF"
			/>
			<path
				d="M18.5433 8.48884C18.8269 8.94255 18.7031 9.53908 18.2624 9.8425L13.5174 13.1096C13.1759 13.3447 12.7247 13.3447 12.3831 13.1096L7.63808 9.8425C7.1974 9.53908 7.07361 8.94255 7.35718 8.48884L8.19235 7.15257C8.5305 6.61153 9.282 6.52124 9.73869 6.96679L12.2519 9.41873C12.6404 9.79769 13.2602 9.79769 13.6486 9.41873L16.1618 6.96679C16.6185 6.52124 17.37 6.61153 17.7082 7.15257L18.5433 8.48884Z"
				fill="#DC79FF"
			/>
		</svg>
		<p class="ml-2">{prettyFormatAddress(recipient)}</p>
	</div>

	<a href={transactionLink} target="_blank" class="mt-4 flex text-ccGray hover:underline"
		>View transaction
		<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-1.5">
			<path
				d="M15 8.75V15.9375C15 16.1427 14.9596 16.3459 14.8811 16.5354C14.8025 16.725 14.6874 16.8973 14.5424 17.0424C14.3973 17.1874 14.225 17.3025 14.0354 17.3811C13.8459 17.4596 13.6427 17.5 13.4375 17.5H4.0625C3.6481 17.5 3.25067 17.3354 2.95765 17.0424C2.66462 16.7493 2.5 16.3519 2.5 15.9375V6.5625C2.5 6.1481 2.66462 5.75067 2.95765 5.45765C3.25067 5.16462 3.6481 5 4.0625 5H10.6047M13.125 2.5H17.5V6.875M8.75 11.25L17.1875 2.8125"
				stroke="#707070"
				stroke-width="1.25"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</a>

	<div class="w-full p-3 mt-5">
		<button
			type="button"
			on:click={tokenscript.action.closeCard}
			class="w-full py-4 bg-ccPurple-dark hover:bg-indigo-700 text-white rounded-xl text-xl"
			>Ok</button
		>
	</div>
</div>
