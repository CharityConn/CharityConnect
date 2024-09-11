export function prettyFormatAddress(address: string) {
	if (address.length < 10) {
		return address;
	} else {
		const firstChars = address.substring(0, 6);
		const lastChars = address.substring(address.length - 4);
		return `${firstChars}...${lastChars}`;
	}
}
