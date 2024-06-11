import { ethers } from "ethers";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DbService } from "../_core/services/dbService";
import { Action } from "../_core/type";
import { SCHEMAS, serverWallet } from "../constant";
import { env } from "../env";
import {
  createAndUploadClaimingOffserAttestation,
  createAndUploadSellingOffserAttestation,
  createIdAttestation,
  verifyIdSignature,
  verifyOfferForClaimingSignature,
  verifyOfferForSellingSignature,
} from "../services/easAttestationService";
import {
  getApproved,
  getContractOwner,
  ownerOf,
} from "../services/ethersService";
import {
  createIdAttest,
  findByDecoded,
  getRawdata,
} from "../services/externalApi";
import { verifySecret } from "../services/idSecretService";
import {
  AttestIdRequest,
  ClaimingOfferRequest,
  DeliveryRequest,
  SellingOfferRequest,
  attestIdPostSchema,
  claimingOfferPostSchema,
  deliveryPostSchema,
  rawdataRequestSchema,
  sellingOfferPostSchema,
} from "./requestSchemas";

export const createSellingOffer: Action = {
  path: "/selling-offers",
  method: "post",
  options: {
    schema: {
      body: sellingOfferPostSchema,
    },
  },
  handler: createSellingOfferHandler,
};

async function createSellingOfferHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as SellingOfferRequest;
  console.log("###", data);
  const seller = verifyOfferForSellingSignature(
    data.dvp,
    data.offer,
    data.signature
  );

  const owner = await ownerOf(data.offer.token, data.offer.id);
  console.log("owner", owner, seller);
  if (owner !== seller) {
    reply.status(401).send({ message: `This nft is not owned by you` });
    return;
  }

  // verify dvp contract == new contract(token, nftAbi).getApproved(id)
  const isApproved = await getApproved(
    seller,
    data.offer.token,
    data.offer.id,
    data.dvp
  );

  console.log("isApproved", isApproved);
  if (!isApproved) {
    reply.status(400).send({ message: "Not approved" });
    return;
  }
  // verify there is no duplicate in sln-a db, findByDecoded({token, id, schemaId})
  const wallet = new ethers.Wallet(env.ATTESTER_SK);
  const message = `${data.offer.id}-${JSON.stringify(data.offer.token)}`;
  const signature = await wallet.signMessage(message);

  const attestation = await findByDecoded(
    data.offer.token,
    data.offer.id,
    SCHEMAS!.offerForSelling[1],
    message,
    signature
  );

  if (attestation.data) {
    //reply.status(400).send({ message: "duplicate" });

    return { attester: attestation.data.attester, uid: attestation.data.uid };
  }

  const result = await createAndUploadSellingOffserAttestation(
    data,
    seller,
    data.scriptURI
  );
  return { attester: result.data.attester, uid: result.data.uid };
}

export const createClaimingOffer: Action = {
  path: "/claiming-offers",
  method: "post",
  options: {
    schema: {
      body: claimingOfferPostSchema,
    },
  },
  handler: createClaimingOfferHandler,
};

async function createClaimingOfferHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as ClaimingOfferRequest;
  const seller = verifyOfferForClaimingSignature(
    data.dvp,
    data.offer,
    data.signature
  );

  const owner = await getContractOwner(data.offer.token);
  if (owner !== seller) {
    reply
      .status(401)
      .send({ message: `You are not the owner of this contract` });
    return;
  }

  const result = await createAndUploadClaimingOffserAttestation(data, owner);
  return { attester: result.data.attester, uid: result.data.uid };
}

export const createDelivery: Action = {
  path: "/delivery",
  method: "post",
  options: {
    schema: {
      body: deliveryPostSchema,
    },
  },
  handler: createDeliveryHandler,
};

async function createDeliveryHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as DeliveryRequest;

  const offerAttestation = JSON.parse(data.offer);
  if (offerAttestation.erc20 === ethers.ZeroAddress) {
    reply.status(400).send({
      message: "An ERC20 contract must be provided for a server sider delivery",
    });
    return;
  }

  const dbService: DbService = this.diContainer.resolve("dbService");
  const secretVerified = await verifySecret(
    dbService,
    "email",
    data.id.value,
    Number(data.id.secret)
  );

  if (!secretVerified) {
    reply.status(401).send();
    return;
  }

  const receiver = verifyIdSignature(data.id, data.signature);
  const idAttestation = await createIdAttestation(
    data.id.idType,
    data.id.value,
    receiver
  );

  // if erc20 != zero address, check if erc20(address).allowance(receiver, dvp) >= erc20(price)

  // dvp.deliver(offerAttestation, idAttestation)
}

export const createIdAttestAction: Action = {
  path: "/id",
  method: "post",
  options: {
    schema: {
      body: attestIdPostSchema,
    },
  },
  handler: createIdAttestHandler,
};

async function createIdAttestHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as AttestIdRequest;
  console.log(data);

  const receiver = verifyIdSignature(data.id, data.signature);
  console.log(receiver, data.receiver);

  if (receiver !== data.receiver) {
    reply.status(401).send({ message: "Invalid signature" });
    return;
  }

  try {
    const result = await createIdAttest(
      data.id,
      data.signature,
      data.expireTime,
      await serverWallet.signMessage(JSON.stringify(data.id)),
      data.receiver
    );

    reply.status(201).send(result.data.rawData);
  } catch (e: any) {
    if (e.response && e.response.data) {
      reply.status(500).send(e.response.data);
    } else {
      reply.status(500).send({ message: e.message });
    }
  }
}

export const getAttestationRawdata: Action = {
  path: "/:attester/:tokenId/:chain/rawdata",
  method: "get",
  options: {
    schema: {
      params: rawdataRequestSchema,
    },
  },
  handler: getAttestationRawDataHandler,
};

async function getAttestationRawDataHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { attester, tokenId, chain } = request.params as {
    attester: string;
    tokenId: string;
    chain: string;
  };

  const wallet = new ethers.Wallet(env.ATTESTER_SK);
  const message = `${attester}-${tokenId}`;
  const signature = await wallet.signMessage(message);
  try {
    const attestation = await getRawdata(
      attester,
      tokenId,
      message,
      signature,
      chain
    );

    if (!attestation || !attestation.data) {
      reply.status(404).send({ message: "Not found" });
      return;
    }

    reply.status(201).send(attestation.data);
  } catch (e: any) {
    console.log(e);
    reply.status(404).send({ message: e.message });
    return;
  }
}
