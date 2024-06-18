import { createWalletPass } from './actions/walletPassAction';
import { walletPassCreated } from './actions/webhookActions';
import { Controller, SecurityFilterRule } from './_core/type';

export const controllers: Controller[] = [
  {
    prefix: 'wallet-pass',
    actions: [createWalletPass],
  },
  {
    prefix: 'webhooks',
    actions: [walletPassCreated],
  },
];

export const securityRules: SecurityFilterRule[] = [];
