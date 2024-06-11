import { Assertions } from "ava";
import { ethers } from "ethers";
import { FastifyInstance, InjectOptions } from "fastify";
import { SiweMessage } from "siwe";

export async function testRequest(
  server: FastifyInstance,
  request: InjectOptions,
  expected: {
    statusCode: number;
    body?: string;
    bodyAssertion?: (body: string) => boolean;
  },
  t: Assertions
) {
  const response = await server.inject(request);

  t.is(response.statusCode, expected.statusCode);
  if (expected.body) {
    t.is(response.body, expected.body);
  } else if (expected.bodyAssertion) {
    t.true(expected.bodyAssertion(response.body));
  }
}

export function assertException(
  t: Assertions,
  fn: () => any,
  patialErrorMessage?: string
) {
  const error = t.throws(fn);
  t.true(!!error);
  if (patialErrorMessage) {
    t.true(error?.message.includes(patialErrorMessage));
  }
}

/**
 * siwe login, return sessionId which has been logged in
 */
export async function siweLogin(
  server: FastifyInstance,
  signer: ethers.Signer
) {
  const nonceResponse = await server.inject({
    method: "GET",
    url: "/nonce",
  });
  const sessionId = nonceResponse.cookies.find(
    (cookie) => cookie.name === "sessionId"
  )?.value;
  const nonce = JSON.parse(nonceResponse.body).nonce;
  const message = new SiweMessage({
    domain: "localhost",
    address: await signer.getAddress(),
    statement: "Sign in with Ethereum to the app.",
    uri: "http://localhost/sign-in",
    version: "1",
    chainId: 1,
    nonce: nonce,
  });
  const signature = await signer.signMessage(message.prepareMessage());
  const siginResponse = await server.inject({
    method: "POST",
    url: "/sign-in",
    body: { message: message, signature: signature },
    cookies: { sessionId: sessionId! },
  });
  if (siginResponse.statusCode !== 200) {
    throw new Error(siginResponse.body);
  }

  return sessionId!;
}
