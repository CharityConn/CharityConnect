import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Action } from "../_core/type";

export const verifyWallet: Action = {
  path: "/verify-wallet",
  method: "post",
  options: {
    schema: {
      body: z.any(),
    },
  },
  handler: verifyWalletHandler,
};

async function verifyWalletHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.status(200).send({ message: "OK" });
}
