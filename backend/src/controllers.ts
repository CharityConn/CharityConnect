import { createWalletPass } from "./actions/walletPassAction";
import { walletPassCreated } from "./actions/webhookActions";
import { Controller, SecurityFilterRule } from "./_core/type";
import { checkin } from "./actions/userAction";

export const controllers: Controller[] = [
  {
    prefix: "wallet-pass",
    actions: [createWalletPass],
  },
  {
    prefix: "webhooks",
    actions: [walletPassCreated],
  },
  {
    prefix: "user",
    actions: [checkin],
  },
];

export const securityRules: SecurityFilterRule[] = [];
