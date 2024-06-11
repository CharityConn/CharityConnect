import axios from 'axios';
import { env } from '../env';

export async function getNonce() {
  return await axios.get(`${env.REDBRICK_API}/v1/wallet/generate-nonce`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function verifySignature(signMessage: string, signature: string) {
  return await axios.post(
    `${env.REDBRICK_API}/v1/auth/verify-signature`,
    {
      signMessage,
      signature,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function getUserInfo(accessToken: string) {
  return await axios.get(`${env.REDBRICK_API}/v1/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
