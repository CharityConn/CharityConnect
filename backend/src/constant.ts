import { ethers, Network, Wallet } from 'ethers';
import { z } from 'zod';
import { env } from './env';

export const MAX_LIMIT = 50;
export const BULK_LIMIT = 100;

export const errorResponseSchema = z.object({
  error: z.string(),
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const isProd = env.NODE_ENV === 'prod';
export const CHAIN_ID = isProd ? 8453 : 84532;

const staticNetwork = Network.from(CHAIN_ID);
export const serverProvider = new ethers.JsonRpcProvider(
  'https://base-sepolia.blockpi.network/v1/rpc/public',
  staticNetwork,
  { staticNetwork }
);
export const serverWallet = new Wallet(env.ATTESTER_SK, serverProvider);

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const PASS_CONTRACT = isProd
  ? ''
  : '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721';
export const POINTS_CONTRACT = isProd
  ? ''
  : '0x6E651E97D10D330b761b1759DA88616c4764093d';
