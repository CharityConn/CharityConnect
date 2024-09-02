import { formatUnits } from 'ethers';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { env } from '../env';
import {
  enqueueWalletPassCreation,
  enqueueWalletPassUpdate,
} from '../services/commonApi';
import { totalDonations } from '../services/ethersService';
import {
  buildAppleCreatePayload,
  buildAppleUpdatePayload,
  buildGoogleCreatePayload,
  buildGoogleUpdatePayload,
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

export const updateWalletPass: Action = {
  path: '/',
  method: 'put',
  options: {
    schema: {
      body: z.object({
        passId: z.string(),
        donationAmount: z.number(),
        charityName: z.string().optional(),
      }),
    },
  },
  handler: updateWalletPassHandler,
};

async function updateWalletPassHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const { passId, donationAmount, charityName } = request.body as {
    passId: string;
    donationAmount: number;
    charityName?: string;
  };

  const formattedDonationAmount = formatUnits(donationAmount, 18);
  const total = await totalDonations(passId);
  const formattedTotal = formatUnits(total, 18);
  const msg = `You donated ${formattedDonationAmount} ETH${
    charityName ? ` to ${charityName}` : ''
  }!`;

  // Update donation amount on cc pass if pass exists
  const walletPasses = await getPassByPassId(dbService, passId);
  if (walletPasses && (walletPasses.googleId || walletPasses.appleId)) {
    if (walletPasses.appleId) {
      const params = buildAppleUpdatePayload(passId, msg, formattedTotal);
      await enqueueWalletPassUpdate(walletPasses.appleId, params);
    }

    if (walletPasses.googleId) {
      const params = buildGoogleUpdatePayload(msg, formattedTotal);
      await enqueueWalletPassUpdate(walletPasses.googleId, params);
    }
  }

  return reply.status(200).send();
}
