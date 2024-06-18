import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Action } from "../_core/type";
import { zEthereumAddress } from "../lib/zod-validations";
import { LOGGER } from "../_core/constant";

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
    `checkin with wallet: ${userWallet} with merchant ID: ${merchantID}`
  );
  //TODO server-side sign and send transaction for mint/transfer ERC-20 points to `userWallet` with merchant ID
  return reply.status(200).send({ message: "OK" });
}
