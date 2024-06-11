import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { applyRules } from "../services/securityService";
import { Action, Controller, SecurityFilterRule } from "../type";

export function buildRoutes(
  controllers: Controller[],
  urlSecurityRules: SecurityFilterRule[] = []
) {
  return async (fastify: FastifyInstance) => {
    controllers.forEach((controller) => {
      fastify.register(buildController(controller.actions), {
        prefix: controller.prefix,
      });
    });

    if (urlSecurityRules.length) {
      fastify.addHook("onRequest", buildSecurityVerifer(urlSecurityRules));
    }
  };
}

function buildController(actions: Action[]) {
  return async (fastify: FastifyInstance) => {
    actions.forEach((action) => {
      fastify[action.method](action.path, action.options ?? {}, action.handler);
    });
  };
}

function buildSecurityVerifer(urlSecurityRules: SecurityFilterRule[] = []) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
    // done: HookHandlerDoneFunction
  ) => {
    const matched = applyRules(request.url, request.method, urlSecurityRules);
    if (matched) {
      try {
        const decoded: any = await request.jwtVerify();
        if (!decoded.user) {
          reply.code(401).send({ message: "Invalid JWT Payload" });
        }
        // if (!sessionVerify(request) && !signatureVerify(request)) {
        //   reply.code(401).send({ message: "Unauthorized" });
        // }
      } catch (err: any) {
        reply.code(401).send({ message: "Auth failed", err: err.message });
      }
    }
    // done();
  };
}

// function sessionVerify(request: FastifyRequest): boolean {
//   return !!request.session.siwe?.message;
// }

// function signatureVerify(request: FastifyRequest): boolean {
//   const { id, result, signedMessage } = (request.body as any) ?? {};
//   if (!(id && result && signedMessage)) {
//     return false;
//   }
//   const recovered = ethers.verifyMessage(
//     `${id}-${JSON.stringify(result)}`,
//     signedMessage
//   );
//   if (env.WALLET_ADDRESS_WHITELIST?.includes(recovered)) {
//     return true;
//   }
//   return false;
// }
