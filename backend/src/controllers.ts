import {
  createClaimingOffer,
  createDelivery,
  createIdAttestAction,
  createSellingOffer,
  getAttestationRawdata,
} from "./actions/attestationAction";
import { createOtp } from "./actions/secretAction";

import { fetchNonce, verifyWallet } from "./actions/redbrickAction";
import { verifyWallet as verifyCatLootWallet } from "./actions/catLootAction";
import { Controller, SecurityFilterRule } from "./_core/type";

export const controllers: Controller[] = [
  {
    prefix: "attestations",
    actions: [
      createSellingOffer,
      createClaimingOffer,
      createDelivery,
      createIdAttestAction,
      getAttestationRawdata,
    ],
  },
  {
    prefix: "secret",
    actions: [createOtp],
  },
  {
    prefix: "redbrick",
    actions: [fetchNonce, verifyWallet],
  },
  {
    prefix: "cat-loot",
    actions: [verifyCatLootWallet],
  },
];

export const securityRules: SecurityFilterRule[] = [
  { pattern: /^\/attestations/ },
  { pattern: /^\/redbrick\/verfiy-wallet/ },
];
