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
        passId: z.string(),
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
  const { platform, passId } = request.body as {
    platform: 'google' | 'apple';
    passId: string;
  };

  const params =
    platform === 'google'
      ? buildGoogleWalletPassPayload(passId)
      : buildAppleWalletPassPayload(passId);

  await enqueueWalletPassCreation(passId, params, platform);

  return reply.status(201).send();
}
