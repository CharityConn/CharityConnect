import {
  SchemaEncoder,
  SchemaItem,
} from "@ethereum-attestation-service/eas-sdk";
import { verifyTypedData } from "ethers";
import {
  ClaimingOfferRequest,
  SellingOfferRequest,
} from "../actions/requestSchemas";
import { SCHEMAS, eas, emailTypes, serverWallet, types } from "../constant";
import { env } from "../env";
import { uploadSLNAttestation } from "./externalApi";

export async function createAndUploadSellingOffserAttestation(
  request: SellingOfferRequest,
  seller: string,
  scriptURI: string
) {
  const schecma = [
    { name: "token", value: request.offer.token, type: "address" },
    { name: "id", value: request.offer.id, type: "uint256" },
    {
      name: "receiverIdType",
      value: request.offer.receiverIdType,
      type: "string",
    },
    { name: "receiver", value: request.offer.receiver, type: "string" },
    { name: "erc20", value: request.offer.erc20, type: "address" },
    {
      name: "price",
      value: request.offer.price,
      type: "uint256",
    },
    {
      name: "sellerSignature",
      value: request.signature,
      type: "bytes",
    },
    { name: "scriptURI", value: scriptURI, type: "string" },
  ];

  const sellingOffer = await createAttestation(
    SCHEMAS!.offerForSelling[0],
    SCHEMAS!.offerForSelling[1],
    schecma,
    serverWallet.address
  );

  const attestation = { sig: sellingOffer, signer: seller };
  // upload to sln-a;
  return await uploadSLNAttestation(
    "attester",
    await serverWallet.signMessage(JSON.stringify(attestation, replacer)),
    JSON.stringify(attestation, replacer)
  );
}

const replacer = (key: string, value: any) =>
  typeof value === "bigint" ? value.toString() : value;

export async function createAndUploadClaimingOffserAttestation(
  request: ClaimingOfferRequest,
  seller: string
) {
  const claimingOffer = await createAttestation(
    SCHEMAS!.offerForClaiming[0],
    SCHEMAS!.offerForClaiming[1],
    [
      { name: "token", value: request.offer.token, type: "address" },
      { name: "amount", value: request.offer.amount, type: "uint256" },
      {
        name: "receiverIdType",
        value: request.offer.receiverIdType,
        type: "string",
      },
      { name: "erc20", value: request.offer.erc20, type: "address" },
      { name: "price", value: request.offer.price, type: "uint256" },
      {
        name: "sellerSignature",
        value: request.signature,
        type: "bytes",
      },
      { name: "scriptURI", value: request.scriptURI, type: "string" },
    ],
    serverWallet.address,
    BigInt(Math.round((new Date().getTime() + 1000 * 60 * 60 * 24) / 1000)) // 24 hours
  );
  console.log("claimingOffer--", claimingOffer);

  // upload to sln-a;
  const attestation = { sig: claimingOffer, signer: seller };
  return await uploadSLNAttestation(
    "attester",
    await serverWallet.signMessage(JSON.stringify(attestation, replacer)),
    JSON.stringify(attestation, replacer)
  );
}

export async function createIdAttestation(
  idType: string,
  id: string,
  subject: string
) {
  const scriptURI = "";
  const idAttestation = await createAttestation(
    SCHEMAS!.id[0],
    SCHEMAS!.id[1],
    [
      { name: "idType", value: idType, type: "string" },
      { name: "id", value: id, type: "string" },
      { name: "subject", value: subject, type: "address" },
      { name: "scriptURI", value: scriptURI, type: "string" },
    ],
    subject,
    BigInt(Math.round((new Date().getTime() + 1000 * 60 * 60) / 1000))
  );

  return idAttestation;
}

async function createAttestation(
  schemaSignature: string,
  schema: string,
  data: SchemaItem[],
  recipient: string,
  expirationTime: bigint = 0n
) {
  const offchain = await eas.getOffchain();
  const schemaEncoder = new SchemaEncoder(schemaSignature);
  const encodedData = schemaEncoder.encodeData(data);
  const offchainAttestation = await offchain.signOffchainAttestation(
    {
      recipient,
      expirationTime: 0n,
      time: BigInt(Math.round(new Date().getTime() / 1000)),
      revocable: true,
      version: 1,
      nonce: 0n,
      schema,
      refUID:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      data: encodedData,
    },
    serverWallet
  );

  return offchainAttestation;
}

function slnDomain(verifyingContract?: string) {
  return verifyingContract
    ? {
        name: "Smart-Layer-Attestation-Service",
        chainId: env.CHAIN_ID,
        version: "0.1",
        verifyingContract: verifyingContract,
      }
    : {
        name: "EAS Attestation",
        chainId: env.CHAIN_ID,
        version: "1.2.0",
      };
}

export function verifyOfferForSellingSignature(
  verifyingContract: string,
  offer: {
    token: string;
    id: string;
    receiverIdType: string;
    receiver: string;
    erc20: string;
    price: string;
  },
  signature: string
) {
  const domain = {
    name: "EAS Attestation",
    chainId: env.CHAIN_ID,
    version: "1.2.0",
    verifyingContract: verifyingContract,
  };
  const types = {
    Offer: [
      { name: "token", type: "address" },
      { name: "id", type: "uint256" },
      { name: "receiverIdType", type: "string" },
      { name: "receiver", type: "string" },
      { name: "erc20", type: "address" },
      { name: "price", type: "uint256" },
    ],
  };

  return verifyTypedData(domain, types, offer, signature);
}

export function verifyOfferForClaimingSignature(
  verifyingContract: string,
  offer: {
    token: string;
    amount: string;
    receiverIdType: string;
    erc20: string;
    price: string;
  },
  signature: string
) {
  const domain = {
    name: "EAS Attestation",
    chainId: env.CHAIN_ID,
    version: "1.2.0",
    verifyingContract,
  };
  const types = {
    Offer: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "receiverIdType", type: "string" },
      { name: "erc20", type: "address" },
      { name: "price", type: "uint256" },
    ],
  };
  return verifyTypedData(domain, types, offer, signature);
}

export function verifyIdSignature(
  id: {
    idType: string;
    value: string;
    secret?: string;
  },
  signature: string
) {
  const idTypes = id.idType === "email" ? emailTypes : types;

  return verifyTypedData(slnDomain(), idTypes, id, signature);
}
