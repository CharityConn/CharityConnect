class ApiAdapter {
  private baseURI: string;

  constructor() {
    this.baseURI = 'http://localhost:3006';
    // this.baseURI = 'https://d37i1m1hx1fc5p.cloudfront.net';
  }

  async generateWalletPass(platform: 'google' | 'apple', passId: string) {
    return this.sendReqeust('/wallet-pass', {
      method: 'POST',
      body: JSON.stringify({ platform, passId }),
    });
  }

  async getWalletPasses(passId: string) {
    return this.sendReqeust(`/wallet-pass/${passId}`);
  }

  private async sendReqeust(path: string, options: RequestInit = {}) {
    const response = await fetch(this.baseURI + path, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
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

export const apiAdapter = new ApiAdapter();
