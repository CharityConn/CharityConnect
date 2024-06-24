import { eq, InferModel } from "drizzle-orm";
import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { checkins } from "../domain/schemas/checkins";
import { env } from "../env";
import { zEthereumAddress } from "../lib/zod-validations";
import { enqueueWalletPassUpdate } from "../services/commonApi";
import {
  buildAppleUpdatePayload,
  buildGoogleUpdatePayload,
  getPassByPassId,
} from "../services/walletPassService";
import { LOGGER } from "../_core/constant";
import { DbService } from "../_core/services/dbService";
import { Action } from "../_core/type";

export const checkin: Action = {
  path: "/:userWallet/checkin",
  method: "post",
  options: {
    schema: {
      params: z.object({
        userWallet: zEthereumAddress(),
      }),
      body: z.object({
        passId: z.string(),
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
  const { merchantID, passId } = request.body as {
    merchantID: string;
    passId: string;
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
    {
      constant: true,
      inputs: [{ name: "", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];
  const contract = new Contract(env.POINTS_CONTRACT, abi, provider);
  const existing = Number(await contract.balanceOf(userWallet));

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

  // Update points on cc pass, it's based on the pass owner's cc token balance
  const walletPasses = await getPassByPassId(dbService, passId);
  if (walletPasses && (walletPasses.googleId || walletPasses.appleId)) {
    if (walletPasses.appleId) {
      const params = buildAppleUpdatePayload(existing + tokenCount);
      await enqueueWalletPassUpdate(walletPasses.appleId, params);
    }

    if (walletPasses.googleId) {
      const params = buildGoogleUpdatePayload(existing + tokenCount);
      await enqueueWalletPassUpdate(walletPasses.googleId, params);
    }
  }

  return reply
    .status(200)
    .send({ wallet: userWallet, totalPoints: existing + tokenCount });
}
