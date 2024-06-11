import test from "ava";
import { ethers } from "ethers";
import { FastifyReply, FastifyRequest } from "fastify";
import { Application } from "../../../src/_core/application";
import { Controller, SecurityFilterRule } from "../../../src/_core/type";
import { testRequest } from "../../_utils";

function handler1(request: FastifyRequest, reply: FastifyReply) {
  reply.code(200).send("handler1");
}

async function handler2(request: FastifyRequest, reply: FastifyReply) {
  reply.code(201).send("handler2");
}

const signedWallet1 = new ethers.Wallet(
  "0x94d7c5a5a58e21d8b540984442724df1d7d5ca0aaae3ac76041436b2951cf5a3"
);
const signedWallet2 = new ethers.Wallet(
  "0xc504832fde64d103fd6c1bb4fc3a8c9295b2e3be23d11cc5b7021e29fc1d0d8d"
);

const controllers: Controller[] = [
  {
    prefix: "/",
    actions: [{ path: "/test", method: "get", handler: handler1 }],
  },
  {
    prefix: "/sub",
    actions: [{ path: "/test", method: "post", handler: handler2 }],
  },
  {
    prefix: "/protected",
    actions: [{ path: "/test", method: "get", handler: handler1 }],
  },
  {
    prefix: "/protected",
    actions: [{ path: "/test", method: "post", handler: handler2 }],
  },
  {
    prefix: "/banned-all",
    actions: [{ path: "/test", method: "all", handler: handler1 }],
  },
];

const securityRules: SecurityFilterRule[] = [
  { pattern: /^\/protected/, httpMethod: "post" },
  { pattern: /^\/banned-all/ },
];
const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZHVtbXkiLCJpYXQiOjE2Njg1ODk4MDN9.drk0s1kubyrs_v4CfhiJ5K7vKRQzrFdef8RJUlJz-_4";

const server = new Application()
  .controllers(controllers)
  .securityRules(securityRules)
  .build();

test("route should work", async (t) => {
  await testRequest(
    server,
    {
      method: "GET",
      url: "/test",
    },
    { statusCode: 200, body: "handler1" },
    t
  );

  await testRequest(
    server,
    {
      method: "post",
      url: "/sub/test",
    },
    { statusCode: 201, body: "handler2" },
    t
  );
});

test("sessionVerifier should work", async (t) => {
  const randomWallet = ethers.Wallet.createRandom();
  //const loggedSessionId = await siweLogin(server, randomWallet);
  await testRequest(
    server,
    {
      method: "GET",
      url: "/protected/test",
    },
    { statusCode: 200, body: "handler1" },
    t
  );

  await testRequest(
    server,
    {
      method: "post",
      url: "/protected/test",
    },
    { statusCode: 401 },
    t
  );

  await testRequest(
    server,
    {
      method: "post",
      url: "/protected/test",
      headers: { Authorization: `Bearer ${jwt}bad` },
    },
    { statusCode: 401 },
    t
  );

  //   await testRequest(
  //     server,
  //     {
  //       method: "post",
  //       url: "/protected/test",
  //       cookies: { sessionId: loggedSessionId },
  //     },
  //     { statusCode: 201, body: "handler2" },
  //     t
  //   );

  //   ["GET", "POST", "DELETE"].forEach(
  //     async (method: any) =>
  //       await testRequest(
  //         server,
  //         {
  //           method,
  //           url: "/banned-all/test",
  //         },
  //         { statusCode: 401 },
  //         t
  //       )
  //   );

  //   ["GET", "POST", "DELETE"].forEach(
  //     async (method: any) =>
  //       await testRequest(
  //         server,
  //         {
  //           method,
  //           url: "/banned-all/test",
  //           cookies: { sessionId: loggedSessionId },
  //         },
  //         { statusCode: 200 },
  //         t
  //       )
  //   );
  // });

  // test("/personal-information should work when login with session", async (t) => {
  //   const randomWallet = ethers.Wallet.createRandom();
  //   const loggedSessionId = await siweLogin(server, randomWallet);
  //   await testRequest(
  //     server,
  //     {
  //       method: "GET",
  //       url: "/personal-information",
  //       cookies: { sessionId: loggedSessionId },
  //     },
  //     {
  //       statusCode: 200,
  //       bodyAssertion: (body: string) =>
  //         JSON.parse(body).address === randomWallet.address,
  //     },
  //     t
  //   );
  // });

  // test("signatureVerifier should work", async (t) => {
  //   const randomWallet = ethers.Wallet.createRandom();
  //   const result = { test: "test" };
  //   const messageToSign = `1-${JSON.stringify(result)}`;
  //   const signedMessage1 = await signedWallet1.signMessage(messageToSign);
  //   const signedMessage2 = await signedWallet2.signMessage(messageToSign);
  //   const badSignedMessage = await randomWallet.signMessage(messageToSign);

  //   await testRequest(
  //     server,
  //     {
  //       method: "post",
  //       url: "/protected/test",
  //       body: { id: "1", result, signedMessage: badSignedMessage },
  //     },
  //     { statusCode: 401 },
  //     t
  //   );

  //   await testRequest(
  //     server,
  //     {
  //       method: "post",
  //       url: "/protected/test",
  //       body: { id: "1", result, signedMessage: signedMessage1 },
  //     },
  //     { statusCode: 201 },
  //     t
  //   );

  //   await testRequest(
  //     server,
  //     {
  //       method: "post",
  //       url: "/protected/test",
  //       body: { id: "1", result, signedMessage: signedMessage2 },
  //     },
  //     { statusCode: 201 },
  //     t
  //   );
});
