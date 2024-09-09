//This is meant to be manually toggled to true for production build (and not committed), for now
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
//:'http://localhost:3006';

//TODO backend prod
export const backendHost = isProd ? '' : 'https://d37i1m1hx1fc5p.cloudfront.net';
