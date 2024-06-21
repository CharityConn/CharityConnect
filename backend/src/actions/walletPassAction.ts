import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { env } from '../env';
import { enqueueWalletPassCreation } from '../services/commonApi';
import {
  buildAppleCreatePayload,
  buildGoogleCreatePayload,
  getPassByPassId,
} from '../services/walletPassService';
import { DbService } from '../_core/services/dbService';
import { Action } from '../_core/type';

export const createWalletPass: Action = {
  path: '/',
  method: 'post',
  options: {
    schema: {
      body: z.object({
        platform: z.enum(['google', 'apple']),
        passId: z.string(),
        // signature: z.string(),
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
  const { platform, passId /*signature*/ } = request.body as {
    platform: 'google' | 'apple';
    passId: string;
    // signature: string;
  };

  // const message = JSON.stringify({
  //   platform,
  //   passId,
  // });
  // const recovered = ethers.verifyMessage(message, signature);
  // const owner = await ownerOf(PASS_CONTRACT, passId);
  // if (recovered !== owner)
  //   return reply.status(400).send({ error: 'Invalid signature' });

  const params =
    platform === 'google'
      ? buildGoogleCreatePayload(passId)
      : buildAppleCreatePayload(passId);

  await enqueueWalletPassCreation(passId, params, platform);

  return reply.status(201).send();
}

// TODO: auth
export const getWalletPass: Action = {
  path: '/:id',
  method: 'get',
  options: {
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
  },
  handler: getWalletPassHandler,
};

async function getWalletPassHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const { id } = request.params as {
    id: string;
  };

  const pass = await getPassByPassId(dbService, id);
  if (!pass) {
    return reply.status(404).send({ error: 'Pass not found' });
  }

  return reply.status(200).send({
    apple: pass.appleId && `${env.COMMON_API}/link/wallet-pass/${pass.appleId}`,
    google:
      pass.googleId && `${env.COMMON_API}/link/wallet-pass/${pass.googleId}`,
  });
}
