import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { enqueueWalletPassCreation } from '../services/commonApi';
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
        tokenId: z.string(),
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
  const { platform, tokenId } = request.body as {
    platform: 'google' | 'apple';
    tokenId: string;
  };

  const params =
    platform === 'google'
      ? buildGoogleWalletPassPayload(tokenId)
      : buildAppleWalletPassPayload(tokenId);

  await enqueueWalletPassCreation(tokenId, params, platform);

  return reply.status(201).send();
}
