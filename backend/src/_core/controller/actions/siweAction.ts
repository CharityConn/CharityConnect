// export function getNonce(request: FastifyRequest, reply: FastifyReply) {
//   const nonce = generateNonce();
//   request.session.siwe = {nonce};
//   return reply.code(200).send({nonce});
// }

// export async function signIn(request: FastifyRequest, reply: FastifyReply) {
//   try {
//     const body: any = request.body;
//     if (!body.message) {
//       return reply
//         .code(400)
//         .send({message: 'Expected prepareMessage object as body.'});
//     }
//     const sessionNonce = request.session.siwe?.nonce;
//     const siweMessage = new SiweMessage(body.message);
//     const {data: message} = await siweMessage.verify({
//       signature: body.signature,
//       nonce: sessionNonce,
//     });
//     request.session.siwe!.message = message;
//     return reply.code(200).send({message});
//   } catch (err: any) {
//     return reply.code(400).send(err);
//   }
// }

// export async function personalInformation(
//   request: FastifyRequest,
//   reply: FastifyReply
// ) {
//   const message = request.session.siwe?.message;
//   if (!message) {
//     return reply.status(401).send({message: 'You have to first sign_in'});
//   }
//   return reply.send(message);
// }
