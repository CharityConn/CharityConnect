import { ethers } from 'ethers';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { env } from '../env';
import {
  decodeExternalId,
  updateWalletPassId,
} from '../services/walletPassService';
import { LOGGER } from '../_core/constant';
import { DbService } from '../_core/services/dbService';
import { Action } from '../_core/type';

const logger = LOGGER.child({ from: 'webhook' });

const walletPassCreatedSchema = z.object({
  id: z.string(),
  result: z.any(),
  signedMessage: z.string(),
});

export const walletPassCreated: Action = {
  path: '/wallet-pass-created',
  method: 'post',
  options: {
    schema: {
      body: walletPassCreatedSchema,
    },
  },
  handler: walletPassCreatedHandler,
};

async function walletPassCreatedHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const { id, result, signedMessage } = request.body as z.infer<
    typeof walletPassCreatedSchema
  >;

  const recovered = await ethers.verifyMessage(
    `${id}-${JSON.stringify(result)}`,
    signedMessage
  );
  if (recovered !== env.COMMON_API_CALLBACK_VERIFY_ADDRESS) {
    return reply.status(400).send({ error: 'invalid request signature' });
  }

  const { platform, passId } = decodeExternalId(id);
  await updateWalletPassId(dbService, passId, platform, result.id);

  return reply.status(200).send();
}
