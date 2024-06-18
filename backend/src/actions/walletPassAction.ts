import { ethers } from 'ethers';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PASS_CONTRACT } from '../constant';
import { enqueueWalletPassCreation } from '../services/commonApi';
import { ownerOf } from '../services/ethersService';
import {
  buildAppleWalletPassPayload,
  buildGoogleWalletPassPayload,
} from '../services/walletPassService';
import { Action } from '../_core/type';

export const createWalletPass: Action = {
  path: '/',
  method: 'post',
  options: {
    schema: {
      body: z.object({
        platform: z.enum(['google', 'apple']),
        passId: z.string(),
        signature: z.string(),
      }),
    },
  },
  handler: createWalletPassHandler,
};

async function createWalletPassHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { platform, passId, signature } = request.body as {
    platform: 'google' | 'apple';
    passId: string;
    signature: string;
  };

  const message = JSON.stringify({
    platform,
    passId,
  });
  const recovered = ethers.verifyMessage(message, signature);
  const owner = await ownerOf(PASS_CONTRACT, passId);
  if (recovered !== owner)
    return reply.status(400).send({ error: 'Invalid signature' });

  const params =
    platform === 'google'
      ? buildGoogleWalletPassPayload(passId)
      : buildAppleWalletPassPayload(passId);

  await enqueueWalletPassCreation(passId, params, platform);

  return reply.status(201).send();
}
