import { ethers } from "ethers";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { defaultAvatar, serverWallet } from "../constant";
import { createIdAttest } from "../services/externalApi";
import {
  getNonce,
  getUserInfo,
  verifySignature,
} from "../services/redbrickApi";
import { Action } from "../_core/type";
import {
  verifyWalletPostSchema,
  VerifyWalletRequest,
} from "./requestSchemas";
import {getEligibilityStatus} from "../services/launchpadApi";

export const fetchNonce: Action = {
  path: "/nonce",
  method: "get",
  options: {
    schema: {},
  },
  handler: fetchNonceHandler,
};

async function fetchNonceHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const nonce = await getNonce();

    reply.status(201).send(nonce.data.nonce);
  } catch (e: any) {
    console.log(e);
    reply.status(404).send({ message: e.message });
    return;
  }
}

export const verifyWallet: Action = {
  path: "/verify-wallet",
  method: "post",
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
    return reply.status(401).send({ message: "Invalid signature" });
  }

  const status = await getEligibilityStatus(receiver);

  if (status.data.claimingStartAt > Date.now()) {
    return reply.status(400).send({ message: 'Claiming not started yet' });
  }

  if (status.data.stakedAsset !== 'redbrick') {
    return reply.status(401).send({ message: "No valid redbrick account staking" });
  }

  try {
    const verifyResult = await verifySignature(data.message, data.signature);
    const userInfo = await getUserInfo(verifyResult.data.data.accessToken.accessToken);
    const id = {
      idType: "redbrick-wallet",
      value: data.receiver,
    };
    const result = await createIdAttest(
      id,
      "validated",
      1, //1 hour
      await serverWallet.signMessage(JSON.stringify(id)),
      data.receiver
    );

    return reply.status(201).send({
      userInfo: {
        level: userInfo.data.data.level,
        avatar:
          userInfo.data.data.avatar
            ? userInfo.data.data.avatar.preview
            : defaultAvatar,
        email: userInfo.data.data.email,
        name: userInfo.data.data.name,
        point: userInfo.data.data.point,
      },
      attestation: result.data.rawData,
    });
  } catch (e: any) {
    if (e.response && e.response.data) {
      return reply.status(500).send(e.response.data);
    } else {
      return reply.status(500).send({ message: e.message });
    }
  }
}
