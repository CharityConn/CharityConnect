import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createAndSendEmailOtp } from "../services/idSecretService";
import { DbService } from "../_core/services/dbService";
import { Action } from "../_core/type";
import { otpSecretPostSchema, OtpSecretRequest } from "./requestSchemas";

export const createOtp: Action = {
  path: "/otp",
  method: "post",
  options: {
    schema: {
      body: otpSecretPostSchema,
    },
  },
  handler: createOtpHandler,
};

async function createOtpHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = request.body as OtpSecretRequest;
  if (data.otpType !== "email") {
    reply.status(501).send();
    return;
  }

  const dbService: DbService = this.diContainer.resolve("dbService");
  const result = await createAndSendEmailOtp(dbService, data.target);
  reply.status(201).send(result);
}
