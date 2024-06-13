import { EAS, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { InfuraProvider, Network, Wallet, ethers } from "ethers";
import { z } from "zod";
import { env } from "./env";

export const MAX_LIMIT = 50;
export const BULK_LIMIT = 100;

export const errorResponseSchema = z.object({
  error: z.string(),
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const staticNetwork = Network.from(84532);
export const serverProvider = new ethers.JsonRpcProvider(
  'https://base-sepolia.blockpi.network/v1/rpc/public',
  staticNetwork,
  { staticNetwork }
);
export const serverWallet = new Wallet(env.ATTESTER_SK, serverProvider);

export const contracts = {
  1: {
    schemaRegistry: "0xA7b39296258348C78294F95B872b282326A97BDF",
    eas: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
  },
  11155111: {
    schemaRegistry: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
    eas: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
  },
  80001: {
    schemaRegistry: "0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797",
    eas: "0xaEF4103A04090071165F78D45D83A0C0782c2B2a",
  },
  137: {
    schemaRegistry: "0x7876EEF51A891E737AF8ba5A5E0f0Fd29073D5a7",
    eas: "0x5E634ef5355f45A855d02D66eCD687b1502AF790",
  },
  1001: {
    schemaRegistry: "0x4200000000000000000000000000000000000020",
    eas: "0x4200000000000000000000000000000000000021",
  }
}[env.CHAIN_ID];

if (!contracts) {
  throw new Error(`No EAS contracts found for chain ${env.CHAIN_ID}`);
}

export const schemaRegistry = new SchemaRegistry(contracts.schemaRegistry);
schemaRegistry.connect(serverProvider);

export const eas = new EAS(contracts.eas);
eas.connect(serverProvider);

//export const easVersion = await eas.getVersion();
//export const offchain = await eas.getOffchain();

export const SCHEMAS = {
  11155111: {
    offerForSelling: [
      "address token, uint id, string receiverIdType, string receiver, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0x49e5d2bd5ca331e8fa2f986201d084564795bfea2b4ec8fe673cd3a8f86b88c1",
    ],
    offerForClaiming: [
      "address token, uint amount, string receiverIdType, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0x550025ca785a39a7ab70f10776e03bf74ecff2a4d4f5f9d1d822399f0d2061ad",
    ],
    id: [
      "string idType, string id, address subject, string scriptURI",
      "0x9775cfbff5ebe8ec1e54b36028b3c00e02603eaa3c2178cc0eb445f7a9c163d8",
    ],
  },
  80001: {
    offerForSelling: [
      "address token, uint id, string receiverIdType, string receiver, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0x86968d1bb2ce38b5e5b501d3ff217d867c4609b101de1121a145962bfc4a4530",
    ],
    offerForClaiming: [
      "address token, uint amount, string receiverIdType, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0xc11797ee99493665ec3aa5df9fe4a49c7ab79be6f9926bc3efb72600e7f8d565",
    ],
    id: [
      "string idType, string id, address subject, string scriptURI",
      "0x71490cedeecc0ccba2895dda8bdbcfb1860e21d1a94a13a6a80b430bc1ac06f0",
    ],
  },
  137: {
    offerForSelling: [
      "address token, uint id, string receiverIdType, string receiver, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "", //todo
    ],
    offerForClaiming: [
      "address token, uint amount, string receiverIdType, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0xbfd621f72605c3e63ae0dd385eadf8aba9790ed20206d139c52a3eb6fc4e0146",
    ],
    id: [
      "string idType, string id, address subject, string scriptURI",
      "0x79b84a21253707c939a9dde579dcc048c208a46170b184a8240cb205075ed01c",
    ],
  },
  1001: {
    offerForSelling: [
      "address token, uint id, string receiverIdType, string receiver, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0x49e5d2bd5ca331e8fa2f986201d084564795bfea2b4ec8fe673cd3a8f86b88c1",
    ],
    offerForClaiming: [
      "address token, uint amount, string receiverIdType, address erc20, uint price, bytes sellerSignature, string scriptURI",
      "0x550025ca785a39a7ab70f10776e03bf74ecff2a4d4f5f9d1d822399f0d2061ad",
    ],
    id: [
      "string idType, string id, address subject, string scriptURI",
      "0x9775cfbff5ebe8ec1e54b36028b3c00e02603eaa3c2178cc0eb445f7a9c163d8",
    ],
  },
}[env.CHAIN_ID];

export const OTP_EMAIL_TEMPLATE_URL =
  "https://resources.smartlayer.network/emails/v1/sln_otp.template.html";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const emailTypes = {
  idData: [
    { name: "idType", type: "string" },
    { name: "value", type: "string" },
    { name: "secret", type: "string" },
  ],
};

export const types = {
  idData: [
    { name: "idType", type: "string" },
    { name: "value", type: "string" },
  ],
};

export const defaultAvatar =
  "https://resources.smartlayer.network/images/redbrick/preview.png";
