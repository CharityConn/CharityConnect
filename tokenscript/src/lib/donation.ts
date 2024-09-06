import BigNumber from 'bignumber.js';

export function computeOperationalFee(amount: number) {
	//TODO read `50` from contract
	return Number(
		BigNumber(amount)
			.dividedBy(10000.0 / (10000 + 50))
			.minus(amount)
			.toFixed(9)
	);
}
