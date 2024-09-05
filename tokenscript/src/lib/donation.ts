export function computeOperationalFee(amount: number) {
	//TODO read `50` from contract
	//TODO should use BigNumber
	return Number((amount / (10000.0 / (10000 + 50)) - amount).toFixed(9))
}
