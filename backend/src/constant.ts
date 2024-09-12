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
const rpcUrl = isProd
  ? 'https://base.blockpi.network/v1/rpc/public'
  : 'https://base-sepolia.blockpi.network/v1/rpc/public';

const staticNetwork = Network.from(CHAIN_ID);
export const serverProvider = new ethers.JsonRpcProvider(
  rpcUrl,
  staticNetwork,
  { staticNetwork }
);
export const serverWallet = new Wallet(env.ATTESTER_SK, serverProvider);

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const PASS_CONTRACT = isProd
  ? '0x2F6F12b68165aBb483484927919D0d3fE450462E'
  : '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721';
export const POINTS_CONTRACT = isProd
  ? '0xce8FEC9a10D4642368f124593098f2E4dD643652'
  : '0x6E651E97D10D330b761b1759DA88616c4764093d';
export const DONATION_MGR_CONTRACT = isProd
  ? '0x504E041f9A381a7a52e1496f248908C664095b88'
  : '0x87Aa0A8d5E560F413Eb7C1E860EC3741Ad5cb7DD';

export const TOKEN_EXPLORER_URL = isProd
  ? 'https://basescan.org'
  : 'https://sepolia.basescan.org';
