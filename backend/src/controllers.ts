import { verifyWallet as verifyCatLootWallet } from "./actions/catLootAction";
import { Controller, SecurityFilterRule } from "./_core/type";

export const controllers: Controller[] = [
  {
    prefix: "cat-loot",
    actions: [verifyCatLootWallet],
  },
];

export const securityRules: SecurityFilterRule[] = [
];
