//hhh3 figure out how to set this
//hhh3 use this
export const isProd = false;

//TODO pass contract address for prod
export const passContract: { address: string } = isProd
	? {
			address: '0x0'
		}
	: {
			address: '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721'
		};

export const frontendHost = isProd
	? 'www.charityconnect.io'
	: 'https://d31vrfdo6b6g17.cloudfront.net';
