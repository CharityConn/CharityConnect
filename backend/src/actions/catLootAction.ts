import { ethers } from 'ethers';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { serverWallet } from '../constant';
import { createIdAttest } from '../services/externalApi';
import { getEligibilityStatus } from '../services/launchpadApi';
import { Action } from '../_core/type';
import { verifyWalletPostSchema, VerifyWalletRequest } from './requestSchemas';

export const verifyWallet: Action = {
  path: '/verify-wallet',
  method: 'post',
  options: {
    schema: {
      body: verifyWalletPostSchema,
    },
  },
  handler: verifyWalletHandler,
};

async function verifyWalletHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as VerifyWalletRequest;

  const receiver = ethers.verifyMessage(data.message, data.signature);
  if (receiver !== data.receiver) {
    return reply.status(401).send({ message: 'Invalid signature' });
  }

  const status = await getEligibilityStatus(receiver);

  if (status.data.claimingStartAt > Date.now()) {
    return reply.status(400).send({ message: 'Claiming not started yet' });
  }

  if (
    !(
      (['cat', 'catLoot'].includes(status.data.stakedAsset) || status.data.staking) &&
      status.data.discordJoined &&
      status.data.twitterFollowed
    )
  ) {
    return reply.status(401).send({ message: 'Not eligible to claim' });
  }

  try {
    const id = {
      idType: 'cat-loot-holder',
      value: data.receiver,
    };
    const result = await createIdAttest(
      id,
      'validated',
      1, //1 hour
      await serverWallet.signMessage(JSON.stringify(id)),
      data.receiver
    );

    return reply.status(201).send({ attestation: result.data.rawData });
  } catch (e: any) {
    if (e.response && e.response.data) {
      return reply.status(500).send(e.response.data);
    } else {
      return reply.status(500).send({ message: e.message });
    }
  }
}
