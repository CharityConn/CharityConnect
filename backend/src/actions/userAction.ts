import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Action } from "../_core/type";
import { zEthereumAddress } from "../lib/zod-validations";
import { LOGGER } from "../_core/constant";
import {
  Contract,
  InfuraProvider,
  JsonRpcProvider,
  Network,
  Wallet,
} from "ethers";
import { env } from "../env";
import { DbService } from "../_core/services/dbService";
import { checkins } from "../domain/schemas/checkins";
import { eq, InferModel } from "drizzle-orm";

export const checkin: Action = {
  path: "/:userWallet/checkin",
  method: "post",
  options: {
    schema: {
      params: z.object({
        userWallet: zEthereumAddress(),
      }),
      body: z.object({
        merchantID: z.string(),
      }),
    },
  },
  handler: checkinHandler,
};

type CheckInsSelectType = InferModel<typeof checkins, "select">;

async function checkinHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userWallet } = request.params as {
    userWallet: string;
  };
  const { merchantID } = request.body as {
    merchantID: string;
  };
  LOGGER.info(
    `checkin with wallet: %s with merchant ID: %s`,
    userWallet,
    merchantID
  );

  const dbService: DbService = this.diContainer.resolve("dbService");
  const db = dbService.db();

  //TODO some logic check with database before minting like maybe not within last 24 hours?

  //TODO fix number of ERC-20 to mint. Don't forget about `decimals`
  const tokenCount = 1;
  const [record] = (await db
    .insert(checkins)
    .values({
      walletAddress: userWallet.toLowerCase(),
      merchantID: merchantID.toLowerCase(),
    })
    .returning()) as unknown as CheckInsSelectType[];
  const jsonRpcProvider: JsonRpcProvider | Wallet = new JsonRpcProvider(
    env.CONTRACTS_INFURA_PREFIX + env.INFURA_PROJECT_ID
  );
  const provider = new Wallet(env.ATTESTER_SK, jsonRpcProvider);
  const abi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  const contract = new Contract(env.POINTS_CONTRACT, abi, provider);
  LOGGER.info("Minting to user wallet: %s…", userWallet);
  await contract.mint(userWallet, tokenCount);
  LOGGER.info("Minted to user wallet: %s… tokens: %d", userWallet, tokenCount);
  await db
    .update(checkins)
    .set({
      status: "minted",
      points: tokenCount,
    })
    .where(eq(checkins.id, record.id));

  return reply.status(200).send({ message: "OK" });
}
