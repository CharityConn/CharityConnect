//This is meant to be manually toggled to true for production build (and not committed), for now
export const isProd = false;

export const passContract: { address: string } = isProd
	? {
			address: '0x2F6F12b68165aBb483484927919D0d3fE450462E'
		}
	: {
			address: '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721'
		};

export const frontendHost = isProd
	? 'https://www.charityconnect.io'
	: 'https://testnet.charityconnect.io';
//:'http://localhost:3006';

//TODO backend prod
export const backendHost = isProd ? 'https://backend.charityconnect.io' : 'https://d37i1m1hx1fc5p.cloudfront.net';
