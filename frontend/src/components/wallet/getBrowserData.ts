
let browserData = null;

export const getBrowserData = () => {

	if (browserData)
		return browserData;

	// detect browser
	const isBrave = !!window.navigator['brave']

	// detect if touch device
	let isTouchDevice = false
	let isMobile = window.matchMedia
	if (isMobile) {
		let match_mobile = isMobile('(pointer:coarse)')
		isTouchDevice = match_mobile.matches
	}

	// detect wallet

	let windowEthereum = window.ethereum

	if (typeof window.ethereum === 'undefined') {
		windowEthereum = {
			isMetaMask: false,
			isAlphaWallet: false,
			isTrust: false,
			isStatusWallet: false,
			isGoWallet: false,
			// this prop is TRUE when Metamask disabled or not installed
			isBraveWallet: false,
		}
	}

	const isAlphaWallet = isTouchDevice && !!windowEthereum.isAlphaWallet
	const isTrust = isTouchDevice && !!windowEthereum.isTrust
	const isStatusWallet = isTouchDevice && !!windowEthereum.isStatusWallet
	const isGoWallet = isTouchDevice && !!windowEthereum.isGoWallet
	const isMyEthereumWallet = isTouchDevice && !!windowEthereum.isTrust && !!windowEthereum.isMetaMask
	const isOkxWallet = window.okxwallet?.isOkxWallet
	const isImToken = !!navigator.userAgent.match(/\simToken\//)
	const isGateWallet = !!window.gatewallet;

	const isMetaMask = isTouchDevice && !!windowEthereum.isMetaMask && !isTrust && !isBrave

	browserData = {
		metaMask: isMetaMask,
		anyMetamask: !!windowEthereum.isMetaMask && !isTrust && !windowEthereum.isBraveWallet,
		alphaWallet: isAlphaWallet,
		mew: isMyEthereumWallet,
		trust: isTrust,
		goWallet: isGoWallet,
		status: isStatusWallet,
		imToken: isImToken,
		brave: isBrave,
		okx: isOkxWallet,
		gateWallet: isGateWallet
	}

	return browserData;
}
