class ApiAdapter {
	private baseURI: string;

	constructor(backendHost: string) {
		this.baseURI = backendHost;
	}

	async generateWalletPass(platform: 'google' | 'apple', passId: string) {
		return this.sendReqeust('/wallet-pass', {
			method: 'POST',
			body: JSON.stringify({ platform, passId })
		});
	}

	async getWalletPasses(passId: string) {
		return this.sendReqeust(`/wallet-pass/${passId}`);
	}

	async updateWalletPass(passId: string, donationAmount: number, charityName?: string) {
		return this.sendReqeust('/wallet-pass', {
			method: 'PUT',
			body: JSON.stringify({ passId, donationAmount, charityName })
		});
	}

	private async sendReqeust(path: string, options: RequestInit = {}) {
		const response = await fetch(this.baseURI + path, {
			...options,
			headers: {
				...options.headers,
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) {
			const error = (await response.json()).error;
			throw new Error(`api request failed: ${path}, error: ${error}`);
		}

		try {
			return await response.json();
		} catch {
			return null;
		}
	}
}

export function createApiAdapter(backendHost: string) {
	apiAdapter = new ApiAdapter(backendHost);
}

export let apiAdapter: ApiAdapter
